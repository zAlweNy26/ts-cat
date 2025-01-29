import type { AgentFastReply, ContextInput, IntermediateStep } from '@dto/agent.ts'
import type { MemoryDocument, MemoryMessage } from '@dto/message.ts'
import type { Form, Tool } from '@mh'
import type { AgentStep } from 'langchain/agents'
import type { StrayCat } from './stray-cat.ts'
import { db } from '@db'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate, interpolateFString, SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda, RunnablePassthrough } from '@langchain/core/runnables'
import { log } from '@logger'
import { FormState, isTool, madHatter } from '@mh'
import { parsedEnv } from '@utils'
import { formatDistanceToNow } from 'date-fns'
import { AgentExecutor, AgentRunnableSequence } from 'langchain/agents'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import _Random from 'lodash/random.js'
import { ModelInteractionHandler, NewTokenHandler, RateLimitHandler } from './callbacks.ts'
import { ProceduresOutputParser } from './output-parser.ts'
import { MAIN_PROMPT_PREFIX, MAIN_PROMPT_SUFFIX, TOOL_PROMPT } from './prompts.ts'

/**
 * Manager of Langchain Agent.
 * This class manages the Agent that uses the LLM. It takes care of formatting the prompt and filtering the tools
 * before feeding them to the Agent. It also instantiates the Langchain Agent.
 */
export class AgentManager {
	private verboseRunnable = new RunnableLambda({
		func: (x: any) => {
			if (parsedEnv.verbose) log.dir(x)
			return x
		},
	})

	/**
	 * Executes the procedures chain. It gets the tools and forms and passes them to the agent.
	 *
	 * @param agentInput The input context for the agent.
	 * @param chatHistory The history of the chat as a string.
	 * @param stray The `StrayCat` instance.
	 *
	 * @returns An `AgentFastReply` object containing the result of the procedure chain execution.
	 */
	async executeProceduresChain(agentInput: ContextInput, chatHistory: string, stray: StrayCat) {
		let recalledProcedures = stray.workingMemory.procedural.filter((p) => {
			return ['tool', 'form'].includes(p.metadata?.type)
				&& ['description', 'startExample'].includes(p.metadata?.trigger)
		}).map(p => p.metadata?.source as string)

		const allowedProcedures: Record<string, Tool | Form> = {}
		const returnDirectTools: string[] = []

		recalledProcedures = await madHatter.executeHook('allowedTools', recalledProcedures, stray)

		Array.from([...madHatter.forms.filter(f => f.active), ...madHatter.tools.filter(t => t.active)]).forEach((p) => {
			if (recalledProcedures.includes(p.name)) {
				if (isTool(p) && p.returnDirect) returnDirectTools.push(p.name)
				p.assignCat(stray)
				allowedProcedures[p.name] = p
			}
		})

		const allowedTools = Object.values(allowedProcedures)

		let examples = ''
		if (allowedTools.map(p => p.startExamples).some(examples => examples.length > 0)) {
			examples += allowedTools.reduce((acc, p) => {
				const question = `Question: ${p.startExamples[_Random(p.startExamples.length - 1)]}`
				const example = `{{\n\t"action": "${p.name}",\n\t"actionInput": // Input of the action according to its description\n}}`
				return `${acc}\n${question}\n${example}\n`
			}, '## Here some examples:\n')
			examples += '{{\n\t"action": "final-answer",\n\t"actionInput": null\n}}'
		}

		let prompt = ChatPromptTemplate.fromMessages([
			SystemMessagePromptTemplate.fromTemplate(await madHatter.executeHook('agentPromptInstructions', TOOL_PROMPT, stray)),
		])

		prompt = await prompt.partial({
			tools: allowedTools.map(p => ` - "${p.name}": ${p.description}`).join('\n'),
			tool_names: Object.keys(allowedProcedures).map(p => `"${p}"`).join(', '),
			chat_history: chatHistory,
			scratchpad: '',
			examples,
		})

		const agent = AgentRunnableSequence.fromRunnables([
			RunnablePassthrough.assign({
				agent_scratchpad: x => ((x.intermediateSteps ?? []) as AgentStep[]).reduce((acc, { action, observation }) => {
					let thought = `${action.log}\n`
					thought += `${JSON.stringify({ actionOutput: observation }, undefined, 4)}\n`
					return acc + thought
				}, ''),
			}),
			prompt,
			this.verboseRunnable,
			stray.currentLLM,
			new ProceduresOutputParser(),
		], { singleAction: true })

		const agentExecutor = AgentExecutor.fromAgentAndTools({
			agent,
			tools: allowedTools.filter(isTool),
			returnIntermediateSteps: true,
			maxIterations: 3,
			verbose: parsedEnv.verbose,
		})

		let result = await agentExecutor.invoke(agentInput, {
			callbacks: [new ModelInteractionHandler(stray, 'ProceduresChain')],
		})

		result.returnDirect = false
		const intermediateSteps: IntermediateStep[] = []
		for (const step of (result.intermediateSteps ?? []) as AgentStep[]) {
			const { action, observation } = step
			const { tool, toolInput } = action
			if (returnDirectTools.includes(tool)) result.returnDirect = true
			intermediateSteps.push({
				procedure: tool,
				input: typeof toolInput === 'string' ? toolInput : null,
				observation,
			})
		}

		if ('form' in result && typeof result.form === 'string' && result.form in allowedProcedures) {
			const form = allowedProcedures[result.form] as Form
			form.assignCat(stray)
			stray.activeForm = result.form
			result = await form.next()
			result.returnDirect = true
			intermediateSteps.push({
				procedure: form.name,
				input: null,
				observation: result.output,
			})
		}

		result.intermediateSteps = intermediateSteps

		return result as AgentFastReply
	}

	/**
	 * Executes a memory chain. It uses the prompt prefix and suffix to format the prompt and then
	 * passes it to the LLM.
	 *
	 * @param input The context input to be processed by the memory chain.
	 * @param stray The `StrayCat` instance.
	 * @returns A promise that resolves with the result of the memory chain invocation.
	 */
	async executeMemoryChain(input: ContextInput, stray: StrayCat) {
		const prefix = await madHatter.executeHook('agentPromptPrefix', MAIN_PROMPT_PREFIX, stray)
		const suffix = await madHatter.executeHook('agentPromptSuffix', MAIN_PROMPT_SUFFIX, stray)

		const prompt = ChatPromptTemplate.fromMessages([
			SystemMessagePromptTemplate.fromTemplate(prefix + suffix),
			...(await this.getLangchainChatHistory(stray.getHistory(5))),
		])

		const chain = prompt.pipe(this.verboseRunnable).pipe(stray.currentLLM).pipe(new StringOutputParser())

		return await chain.invoke(input, {
			callbacks: [new NewTokenHandler(stray), new ModelInteractionHandler(stray, 'MemoryChain'), new RateLimitHandler()],
		})
	}

	/**
	 * Executes the form associated with the given stray cat.
	 *
	 * @param stray The `StrayCat` instance whose form is to be executed.
	 * @returns The result of the next step of the form or `undefined` if no form is found.
	 */
	async executeFormAgent(stray: StrayCat) {
		const form = madHatter.forms.find(f => f.name === stray.activeForm)
		if (form) {
			if (form.state === FormState.CLOSED) {
				form.reset()
				stray.activeForm = undefined
			}
			else return await form.next()
		}
		else {
			log.warn('No active form found')
			return undefined
		}
	}

	/**
	 * Executes a tool based on the provided input.
	 *
	 * @param input The context input containing the command or query.
	 * @param stray The `StrayCat` instance to be used with the tool.
	 * @returns An `AgentFastReply` containing the tool's output and intermediate steps, or `undefined` if no tool is executed.
	 */
	async executeTool(input: ContextInput, stray: StrayCat): Promise<AgentFastReply | undefined> {
		const instantTool = db.data.instantTool
		if (!instantTool) return undefined

		const trigger = await madHatter.executeHook('instantToolTrigger', '@{name}', stray)
		if (!trigger) return undefined

		const calledTool = madHatter.tools.filter(t => t.active)
			.find(({ name }) => input.input.startsWith(interpolateFString(trigger, { name })))

		if (calledTool) {
			const toolInput = input.input.replace(interpolateFString(trigger, { name: calledTool.name }), '').trim()
			calledTool.assignCat(stray)
			const output = await calledTool.invoke(toolInput)
			return {
				output,
				intermediateSteps: [{ procedure: calledTool.name, input: toolInput, observation: output }],
			}
		}

		return undefined
	}

	/**
	 * Executes the agent's main logic flow, including hooks, tools, forms, procedures, and memory chains.
	 *
	 * @param stray The `StrayCat` instance.
	 * @returns An `AgentFastReply` object containing the agent's output and any intermediate steps.
	 */
	async executeAgent(stray: StrayCat): Promise<AgentFastReply> {
		const agentInput = await madHatter.executeHook('beforeAgentStarts', {
			input: stray.lastUserMessage.text,
			chat_history: this.stringifyChatHistory(stray.getHistory(5)),
			episodic_memory: this.getEpisodicMemoriesPrompt(stray.workingMemory.episodic),
			declarative_memory: this.getDeclarativeMemoriesPrompt(stray.workingMemory.declarative),
			tools_output: '',
		}, stray)

		const instantTool = await this.executeTool(agentInput, stray)

		if (instantTool) return instantTool

		const fastReply = await madHatter.executeHook('agentFastReply', undefined, stray)

		if (fastReply) return fastReply

		const formResult = await this.executeFormAgent(stray)

		if (formResult) return formResult

		const proceduralMemories = stray.workingMemory.procedural
		let intermediateSteps: IntermediateStep[] = []

		if (proceduralMemories.length > 0) {
			log.debug(`Procedural memories retrieved: ${proceduralMemories.length}`)
			try {
				const proceduresResult = await this.executeProceduresChain(agentInput, agentInput.chat_history, stray)
				const afterProcedures = await madHatter.executeHook('afterProceduresChain', proceduresResult, stray)
				if (afterProcedures.returnDirect) return afterProcedures
				intermediateSteps = afterProcedures.intermediateSteps ?? []
				if (intermediateSteps.length > 0) {
					agentInput.tools_output = `## Tools output: \n`
					agentInput.tools_output += intermediateSteps.reduce((acc, { procedure, observation }) => `${acc}\t- ${procedure}: ${observation}\n`, '')
				}
			}
			catch (error) {
				log.error(`Error executing procedures agent:`)
				log.normal(error)
			}
		}

		const memoryOutput = await this.executeMemoryChain(agentInput, stray)
		const reply: AgentFastReply = {
			output: memoryOutput,
			intermediateSteps,
		}
		const afterMemory = await madHatter.executeHook('afterMemoryChain', reply, stray)

		return afterMemory
	}

	/**
	 * Generates a prompt string that summarizes episodic memories from the provided documents.
	 *
	 * @param docs An array of `MemoryDocument` objects containing the episodic memories.
	 * @returns A formatted string that includes the context of things the user said in the past.
	 * 			If the contents of the documents are empty, an empty string is returned.
	 */
	getEpisodicMemoriesPrompt(docs: MemoryDocument[]) {
		let memoryTexts = docs.map(d => d.pageContent.replace(/\n$/gm, '. '))
		if (memoryTexts.length === 0) return ''
		const memoryTimestamps = docs.map((d) => {
			const timestamp = d.metadata?.when as number
			return ` (${formatDistanceToNow(timestamp, { addSuffix: true, includeSeconds: true })})`
		})
		memoryTexts = memoryTexts.map((text, i) => text + memoryTimestamps[i])
		return `## Context of things the Human said in the past:\n - ${memoryTexts.join('\n - ')}`
	}

	/**
	 * Generates a prompt string that summarizes declarative memories from the provided documents.
	 *
	 * @param docs An array of `MemoryDocument` objects.
	 * @returns A formatted string that includes the context of the documents with relevant information.
	 *          If no documents are provided, an empty string is returned.
	 */
	getDeclarativeMemoriesPrompt(docs: MemoryDocument[]) {
		let memoryTexts = docs.map(d => d.pageContent.replace(/\n$/gm, '. '))
		if (memoryTexts.length === 0) return ''
		const memorySources = docs.map(d => ` (extracted from ${d.metadata?.source})`)
		memoryTexts = memoryTexts.map((text, i) => text + memorySources[i])
		return `## Context of documents containing relevant information:\n - ${memoryTexts.join('\n - ')}`
	}

	/**
	 * Converts an array of `MemoryMessage` objects into a formatted string.
	 *
	 * @param history An array of `MemoryMessage` objects representing the chat history.
	 * @returns A string containing the formatted chat history.
	 */
	stringifyChatHistory(history: MemoryMessage[]) {
		return history.map(m => `\n - ${m.role}: ${m.what}`).join('')
	}

	/**
	 * Converts an array of `MemoryMessage` into LangChain `BaseMessage` objects.
	 *
	 * @param history An array of `MemoryMessage` objects representing the chat history.
	 * @returns An array of messages from the LangChain's `ChatMessageHistory` instance.
	 */
	getLangchainChatHistory(history: MemoryMessage[]) {
		const chatHistory = new ChatMessageHistory()
		history.forEach((m) => {
			if (m.role === 'AI') chatHistory.addMessage(new AIMessage({ name: m.who, content: m.what }))
			else chatHistory.addMessage(new HumanMessage({ name: m.who, content: m.what }))
		})
		return chatHistory.getMessages()
	}
}
