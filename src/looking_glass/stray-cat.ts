import type { AgentFastReply } from '@dto/agent.ts'
import type { EmbedderInteraction, MemoryMessage, MemoryRecallConfigs, Message, ModelInteraction, WorkingMemory, WSMessage } from '@dto/message.ts'
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import type { BaseMessageChunk } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import type { ServerWebSocket } from 'bun'
import type { TSchema } from 'elysia'
import type { TypeCheck } from 'elysia/type-system'
import type { ElysiaWS } from 'elysia/ws'
import { resolveObjectURL } from 'node:buffer'
import { Document } from '@langchain/core/documents'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables'
import { log } from '@logger'
import { madHatter } from '@mh'
import { rabbitHole } from '@rh'
import { normalizeMessageChunks } from '@utils'
import callsites from 'callsites'
import { createSqlQueryChain, type SqlDialect } from 'langchain/chains/sql_db'
import { SqlDatabase } from 'langchain/sql_db'
import { QuerySqlTool } from 'langchain/tools/sql'
import { DataSource, type DataSourceOptions } from 'typeorm'
import { ModelInteractionHandler, NewTokenHandler, RateLimitHandler } from './callbacks.ts'
import { cheshireCat } from './cheshire-cat.ts'

export type WS = ElysiaWS<
	ServerWebSocket<{
		validator?: TypeCheck<TSchema>
	}>,
	any,
	any
>

/**
 * The stray cat goes around tools and hook, making troubles
 */
export class StrayCat {
	private chatHistory: MemoryMessage[] = []
	private modelsInteractions: ModelInteraction[] = []
	private userMessage!: Message
	public wsQueue: WSMessage[] = []
	public activeForm?: string
	public workingMemory: WorkingMemory = {
		episodic: [],
		declarative: [],
		procedural: [],
	}

	constructor(public userId: string, private ws?: WS) { }

	get lastUserMessage() {
		return this.userMessage
	}

	get plugins() {
		return madHatter.installedPlugins
	}

	get currentLLM() {
		return cheshireCat.currentLLM
	}

	get currentEmbedder() {
		return cheshireCat.currentEmbedder
	}

	get vectorMemory() {
		return cheshireCat.vectorMemory
	}

	get agentManager() {
		return cheshireCat.agentManager
	}

	get whiteRabbit() {
		return cheshireCat.whiteRabbit
	}

	get rabbitHole() {
		return cheshireCat.rabbitHole
	}

	/**
	 * Retrieves information about a plugin based on where it's executed.
	 * @returns An object containing the plugin's active status, manifest, and settings.
	 *
	 * Returns undefined if the plugin is not found.
	 */
	async getPluginInfo() {
		const paths = callsites().map(site => site.getFileName())
		const tmp = paths.find(path => path?.includes('blob:'))
		if (!tmp) return undefined
		const blob = resolveObjectURL(tmp)
		if (!blob) return undefined
		const text = await blob.text()
		const id = text.match(/^\/\/ ID:\s*(\S+)/)?.[1]
		if (!id) return undefined
		const plugin = madHatter.getPlugin(id)
		if (!plugin) return undefined
		const { active, manifest, settings } = plugin
		return {
			active,
			manifest,
			settings,
		}
	}

	/**
	 * This property is used to establish a new WebSocket connection.
	 * @param value The WebSocket instance.
	 */
	addWebSocket(value: WS | undefined) {
		this.ws = value
	}

	/**
	 * Sends a message through the websocket connection.
	 *
	 * If the websocket connection is not open, the message is queued.
	 *
	 * If the message is of type 'chat', it is also stored in the chat history.
	 * @param msg The message to send.
	 */
	send(msg: WSMessage) {
		if (this.ws) {
			this.ws.send(JSON.stringify(msg))
			if (msg.type === 'chat') this.chatHistory.push(msg)
		}
		else {
			log.warn(`No websocket connection is open for "${this.userId}". Queuing the message...`)
			this.wsQueue.push(msg)
		}
		madHatter.executeHook('afterSendMessage', msg, this)
	}

	/**
	 * Processes the user message and returns the response.
	 * @param msg The message to send.
	 * @param save Whether to save the message or not in the chat history (default: true).
	 * @returns The response message.
	 */
	async run(msg: Message, save = true): Promise<WSMessage> {
		log.info(`Received message from user "${this.userId}":`)
		log.info(msg)

		const response = this.userMessage = await madHatter.executeHook('beforeReadMessage', msg, this)

		// TODO: Find another way to handle this
		if (response.text.length > cheshireCat.embedderSize) {
			log.warn(`The input is too long. Storing it as document...`)
			await rabbitHole.ingestContent(this, response.text)
			return {
				type: 'notification',
				content: 'The input is too long. Storing it as document...',
			}
		}

		if (save) this.chatHistory.push({ role: 'User', what: response.text, who: this.userId, when: Date.now() })

		try { await this.recallRelevantMemories() }
		catch (error) {
			log.error(error)
			return {
				type: 'error',
				name: 'MemoryRecallError',
				description: 'An error occurred while trying to recall relevant memories.',
			}
		}

		let catMsg: AgentFastReply
		try {
			catMsg = await this.agentManager.executeAgent(this)
		}
		catch (error) {
			log.error(error)
			catMsg = {
				output: 'I am sorry, I could not process your request.',
				intermediateSteps: [],
			}
		}

		log.normal('Agent response:')
		log.dir(catMsg)

		let doc = new Document<Record<string, any>>({
			pageContent: response.text,
			metadata: {
				who: this.userId,
				when: Date.now(),
			},
		})
		doc = await madHatter.executeHook('beforeStoreEpisodicMemory', doc, this)
		const docEmbedding = await this.currentEmbedder.embedDocuments([response.text])
		if (docEmbedding.length === 0) throw new Error('Could not embed the document.')
		await this.vectorMemory.collections.episodic.addPoint(doc.pageContent, docEmbedding[0]!, doc.metadata)

		const finalOutput = await madHatter.executeHook('beforeSendMessage', {
			role: 'AI',
			what: catMsg.output,
			who: this.userId,
			when: Date.now(),
			why: {
				input: response.text,
				intermediateSteps: catMsg.intermediateSteps ?? [],
				memory: this.workingMemory,
				interactions: this.modelsInteractions,
			},
		}, this)

		if (save) this.chatHistory.push(finalOutput)

		this.modelsInteractions = []

		return {
			type: 'chat',
			...finalOutput,
		}
	}

	/**
	 * @experimental Classifies the given sentence into one of the provided labels.
	 * @param sentence The sentence to classify.
	 * @param labels The labels to classify the sentence into.
	 * @param examples Optional examples to help the LLM classify the sentence.
	 * @returns The label of the sentence or null if it could not be classified.
	 */
	async classify<S extends string, T extends [S, ...S[]]>(sentence: string, labels: T, examples?: { [key in T[number]]: S[] }) {
		let examplesList = ''
		if (examples && Object.keys(examples).length > 0) {
			examplesList += Object.entries(examples)
				.reduce((acc, [l, ex]) => `${acc}\n"${ex}" -> "${l}"`, '\n\nExamples:')
		}

		const labelsList = `"${labels.join('", "')}"`
		const prompt = `Classify this sentence:
"${sentence}"

Allowed classes are:
${labelsList}${examplesList}

"${sentence}" -> `

		const response = normalizeMessageChunks(await this.llm(prompt))
		log.info(`Classified sentence: ${response}`)

		const label = labels.find(w => response.includes(w))
		if (label) return label
		else return null
	}

	/**
	 * @experimental Executes a SQL query based on a natural language question.
	 * @param question The user question.
	 * @param type The SQL dialect to use.
	 * @param source The data source to execute the query on.
	 * @returns The result of the SQL query in natural language.
	 */
	async queryDb<T extends Exclude<SqlDialect, 'sap hana'>>(
		question: string,
		type: T,
		source: Omit<Extract<DataSourceOptions, { type: T }>, 'type'>, // TODO: Fix type inference for `mysql`
	) {
		const appDataSource = new DataSource({ type, ...source } as DataSourceOptions)
		const db = await SqlDatabase.fromDataSourceParams({ appDataSource })

		const executeQuery = new QuerySqlTool(db)
		const writeQuery = await createSqlQueryChain({
			llm: this.currentLLM,
			db,
			dialect: type,
		})

		const answerPrompt = PromptTemplate.fromTemplate(
			`Given the following user question, corresponding SQL query, and SQL result, answer the user question.
			Question: {question}
			SQL Query: {query}
			SQL Result: {result}
			Answer: `,
		)

		const answerChain = answerPrompt.pipe(this.currentLLM).pipe(new StringOutputParser())

		const chain = RunnableSequence.from([
			RunnablePassthrough.assign({ query: writeQuery }).assign({
				result: (i: { query: string }) => executeQuery.invoke(i.query),
			}),
			answerChain,
		])
		return await chain.invoke({ question })
	}

	/**
	 * If passed a number k, retrieves the last k messages in the chat history.
	 * Otherwise, retrieves all messages in the chat history.
	 * @param k the number of messages to retrieve
	 * @returns the messages present in the chat history
	 */
	getHistory(k?: number) {
		return k ? this.chatHistory.slice(-k) : [...this.chatHistory]
	}

	/**
	 * Clears the chat history.
	 */
	clearHistory() {
		this.chatHistory = []
	}

	/**
	 * Adds messages to the chat history.
	 * @param message the messages to add
	 */
	addHistory(message: MemoryMessage[]) {
		this.chatHistory.push(...message)
	}

	/**
	 * Adds an interaction to the working memory.
	 * @param interaction the interaction to add
	 */
	addInteraction(interaction: ModelInteraction) {
		this.modelsInteractions.push(interaction)
		madHatter.executeHook('afterModelInteraction', interaction, this)
	}

	/**
	 * If passed a number k, retrieves the last k interactions in the working memory.
	 * Otherwise, retrieves all interactions in the working memory.
	 * @param k the number of interactions to retrieve
	 * @returns the interactions present in the working memory
	 */
	getInteraction(k?: number) {
		return k ? this.modelsInteractions.slice(-k) : [...this.modelsInteractions]
	}

	/**
	 * Recalls relevant memories based on the given query.
	 * If no query is provided, it uses the last user's message text as the query.
	 * @param query The query string to search for relevant memories.
	 */
	async recallRelevantMemories(query?: string) {
		if (!query) query = this.userMessage.text

		const interaction: EmbedderInteraction = {
			model: 'embedder',
			source: 'RecallQuery',
			prompt: query,
			reply: [],
			outputTokens: 0,
			startedAt: Date.now(),
			endedAt: Date.now(),
		}

		query = await madHatter.executeHook('recallQuery', query, this)
		log.info(`Recall query: ${query}`)

		interaction.prompt = query
		interaction.outputTokens = await this.rabbitHole.textSplitter.lengthFunction(query)

		const queryEmbedding = await this.currentEmbedder.embedQuery(query)

		let recallConfigs: MemoryRecallConfigs = {
			declarative: {
				embedding: queryEmbedding,
				k: 3,
				threshold: 0.7,
				filter: {
					source: { any: [this.userId] },
				},
			},
			episodic: {
				embedding: queryEmbedding,
				k: 3,
				threshold: 0.7,
			},
			procedural: {
				embedding: queryEmbedding,
				k: 3,
				threshold: 0.7,
			},
		}
		recallConfigs = {
			...recallConfigs,
			...await madHatter.executeHook('beforeRecallMemories', recallConfigs, this),
		}
		for (const [key, value] of Object.entries(recallConfigs)) {
			const memories = await this.vectorMemory.collections[key]?.recallMemoriesFromEmbedding(
				value.embedding,
				value.filter,
				value.k,
				value.threshold,
			) ?? []
			log.info(`Recalled ${memories.length} memories for ${key} collection.`)
			this.workingMemory[key] = memories
		}
		madHatter.executeHook('afterRecallMemories', this)

		interaction.reply = queryEmbedding
		interaction.endedAt = Date.now()
		this.addInteraction(interaction)
	}

	/**
	 * Executes the LLM with the given prompt and returns the response.
	 * @param prompt The prompt or messages to be passed to the LLM.
	 * @param stream Optional parameter to enable streaming mode.
	 */
	async llm(prompt: BaseLanguageModelInput, stream?: false): Promise<BaseMessageChunk>
	async llm(prompt: BaseLanguageModelInput, stream?: true): Promise<IterableReadableStream<BaseMessageChunk>>
	async llm(prompt: BaseLanguageModelInput, stream = false): Promise<BaseMessageChunk | IterableReadableStream<BaseMessageChunk>> {
		const callbacks: BaseCallbackHandler[] = []
		if (stream) callbacks.push(new NewTokenHandler(this))
		callbacks.push(new ModelInteractionHandler(this, 'StrayCat'), new RateLimitHandler())
		if (stream) return this.currentLLM.stream(prompt, { callbacks })
		return this.currentLLM.invoke(prompt, { callbacks })
	}
}
