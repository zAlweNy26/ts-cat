import { AgentExecutor, LLMSingleActionAgent } from 'langchain/agents'
import { LLMChain } from 'langchain/chains'
import { PromptTemplate, interpolateFString } from '@langchain/core/prompts'
import { formatDistanceToNow } from 'date-fns'
import type { AgentStep, ChainValues } from 'langchain/schema'
import { type Form, FormState, type Tool, isTool, madHatter } from '@mh'
import { parsedEnv } from '@utils'
import { log } from '@logger'
import { db } from '@db'
import { MAIN_PROMPT_PREFIX, MAIN_PROMPT_SUFFIX, TOOL_PROMPT, ToolPromptTemplate } from './prompts.ts'
import type { MemoryDocument, MemoryMessage, StrayCat } from './stray-cat.ts'
import { ProceduresOutputParser } from './output-parser.ts'
import { NewTokenHandler } from './callbacks.ts'

export interface AgentInput {
	input: string
	chat_history: string
	episodic_memory: string
	declarative_memory: string
	[key: string]: string
}

export interface IntermediateStep {
	tool: string
	toolInput: string
	observation: string
}

export interface AgentFastReply {
	output: string
	intermediateSteps?: IntermediateStep[]
}

export type InstantToolTrigger = `${string}{name}${string}`

/**
 * Manager of Langchain Agent.
 * This class manages the Agent that uses the LLM. It takes care of formatting the prompt and filtering the tools
 * before feeding them to the Agent. It also instantiates the Langchain Agent.
 */
export class AgentManager {
	async executeProceduresChain(agentInput: AgentInput, stray: StrayCat) {
		const recalledProcedures = stray.workingMemory.procedural.filter((p) => {
			return ['tool', 'form'].includes(p.metadata?.type)
				&& ['description', 'startExample'].includes(p.metadata?.trigger)
		}).map(p => p.metadata?.source as string)

		const allowedProcedures: Record<string, Tool | Form> = {}
		const allowedTools: Tool[] = []
		const returnDirectTools: string[] = []

		Array.from([...madHatter.forms.filter(f => f.active), ...madHatter.tools.filter(t => t.active)]).forEach((p) => {
			if (recalledProcedures.includes(p.name)) {
				if (isTool(p)) {
					allowedTools.push(p.assignCat(stray))
					if (p.returnDirect) returnDirectTools.push(p.name)
				}
				allowedProcedures[p.name] = p
			}
		})

		const prompt = new ToolPromptTemplate(allowedProcedures, {
			template: madHatter.executeHook('agentPromptInstructions', TOOL_PROMPT, stray),
			inputVariables: ['input', 'tools', 'tool_names', 'intermediate_steps', 'agent_scratchpad', 'examples'],
		})

		const agentChain = new LLMChain({
			prompt,
			llm: stray.currentLLM,
			verbose: parsedEnv.verbose,
		})

		const agent = new LLMSingleActionAgent({
			llmChain: agentChain,
			outputParser: new ProceduresOutputParser(),
			stop: ['}'],
		})

		const agentExecutor = AgentExecutor.fromAgentAndTools({
			agent,
			tools: allowedTools.filter(t => madHatter.executeHook('allowedTools', allowedTools.map(a => a.name), stray).includes(t.name)),
			returnIntermediateSteps: true,
			verbose: parsedEnv.verbose,
		})

		let result = await agentExecutor.invoke(agentInput)

		result.returnDirect = false
		const intermediateSteps: IntermediateStep[] = []
		for (const step of (result.intermediateSteps ?? []) as AgentStep[]) {
			const { action, observation } = step
			const { tool, toolInput } = action
			if (returnDirectTools.includes(tool)) result.returnDirect = true
			intermediateSteps.push({ tool, toolInput, observation })
		}
		result.intermediateSteps = intermediateSteps

		if ('form' in result && typeof result.form === 'string') {
			const form = allowedProcedures[result.form] as Form
			form.assignCat(stray)
			stray.activeForm = result.form
			result = form.next()
			result.returnDirect = true
		}

		return result
	}

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

	async executeMemoryChain(input: AgentInput, prefix: string, suffix: string, stray: StrayCat) {
		const inputVariables = Object.keys(input).filter(k => (prefix + suffix).includes(k))
		const prompt = new PromptTemplate({
			template: prefix + suffix,
			inputVariables,
		})
		const memoryChain = new LLMChain({
			prompt,
			llm: stray.currentLLM,
			verbose: parsedEnv.verbose,
			outputKey: 'output',
		})
		return await memoryChain.invoke(input, { callbacks: [new NewTokenHandler(stray)] })
	}

	async executeTool(input: AgentInput, stray: StrayCat): Promise<ChainValues | undefined> {
		const trigger = madHatter.executeHook('instantToolTrigger', '@{name}', stray)

		if (!trigger) return undefined

		const calledTool = madHatter.tools.filter(t => t.active)
			.find(({ name }) => input.input.startsWith(interpolateFString(trigger, { name })))
		const instantTool = db.data.instantTool

		if (calledTool && instantTool) {
			const toolInput = input.input.replace(interpolateFString(trigger, { name: calledTool.name }), '').trim()
			calledTool.assignCat(stray)
			return { output: await calledTool.call(toolInput) }
		}
		return undefined
	}

	async executeAgent(stray: StrayCat): Promise<ChainValues> {
		const episodicMemoryFormatted = this.getEpisodicMemoriesPrompt(stray.workingMemory.episodic)
		const declarativeMemoryFormatted = this.getDeclarativeMemoriesPrompt(stray.workingMemory.declarative)
		const chatHistoryFormatted = this.getChatHistoryPrompt(stray.getHistory())
		const input = stray.lastUserMessage

		const agentInput = madHatter.executeHook('beforeAgentStarts', {
			input: input.text,
			chat_history: chatHistoryFormatted,
			episodic_memory: episodicMemoryFormatted,
			declarative_memory: declarativeMemoryFormatted,
		}, stray)

		const instantTool = await this.executeTool(agentInput, stray)

		if (instantTool) return instantTool

		const fastReply = madHatter.executeHook('agentFastReply', undefined, stray)

		if (fastReply) return fastReply

		const promptPrefix = madHatter.executeHook('agentPromptPrefix', MAIN_PROMPT_PREFIX, stray)
		const promptSuffix = madHatter.executeHook('agentPromptSuffix', MAIN_PROMPT_SUFFIX, stray)

		const formResult = await this.executeFormAgent(stray)

		if (formResult) return formResult

		const intermediateSteps: IntermediateStep[] = []
		const proceduralMemories = stray.workingMemory.procedural

		if (proceduralMemories.length > 0) {
			log.debug(`Procedural memories retrieved: ${proceduralMemories.length}`)
			try {
				const proceduresResult = await this.executeProceduresChain(agentInput, stray)
				const afterProcedures = madHatter.executeHook('afterProceduresChain', proceduresResult, stray)
				if (afterProcedures.returnDirect) return afterProcedures
				if (afterProcedures.output) agentInput.tools_output = `## Tools output: \n${afterProcedures.output}`
				intermediateSteps.push(...(afterProcedures.intermediateSteps ?? []))
			}
			catch (error) {
				log.error(`Error executing procedures agent:`)
				log.normal(error)
			}
		}

		if (agentInput.tools_output === undefined) agentInput.tools_output = ''

		const result = await this.executeMemoryChain(agentInput, promptPrefix, promptSuffix, stray)
		result.intermediateSteps = intermediateSteps
		const afterMemory = madHatter.executeHook('afterMemoryChain', result, stray)

		return afterMemory
	}

	getEpisodicMemoriesPrompt(docs: MemoryDocument[]) {
		let memoryTexts = docs.map(d => d.pageContent.replace(/\n/gm, '. '))
		if (memoryTexts.length === 0) return ''
		const memoryTimestamps = docs.map((d) => {
			const timestamp = d.metadata?.when as number
			return ` (${formatDistanceToNow(timestamp, { addSuffix: true, includeSeconds: true })})`
		})
		memoryTexts = memoryTexts.map((text, i) => text + memoryTimestamps[i])
		return `## Context of things the Human said in the past: ${memoryTexts.join('\n - ')}`
	}

	getDeclarativeMemoriesPrompt(docs: MemoryDocument[]) {
		let memoryTexts = docs.map(d => d.pageContent.replace(/\n/gm, '. '))
		if (memoryTexts.length === 0) return ''
		const memorySources = docs.map(d => ` (extracted from ${d.metadata?.source})`)
		memoryTexts = memoryTexts.map((text, i) => text + memorySources[i])
		return `## Context of documents containing relevant information: ${memoryTexts.join('\n - ')}`
	}

	getChatHistoryPrompt(history: MemoryMessage[]) {
		return history.map(m => `\n - ${m.who}: ${m.what}`).join('')
	}
}
