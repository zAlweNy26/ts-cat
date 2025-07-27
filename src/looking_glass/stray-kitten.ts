import type { EmbedderInteraction, MemoryMessage, MemoryRecallConfigs, Message, ModelInteraction, WorkingMemory, WSMessage } from '@dto/message.ts'
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import type { AIMessageChunk } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import type { ElysiaWS as WS } from 'elysia/ws'
import type { DataSourceOptions } from 'typeorm'
import type { z } from 'zod'
import { Document } from '@langchain/core/documents'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables'
import { log } from '@logger'
import { madHatter } from '@mh'
import { deepDefaults, normalizeMessageChunks } from '@utils'
import { closest as closestLevenshtein } from 'fastest-levenshtein'
import { createSqlQueryChain } from 'langchain/chains/sql_db'
import { SqlDatabase } from 'langchain/sql_db'
import { QuerySqlTool } from 'langchain/tools/sql'
import { DataSource } from 'typeorm'
import { catchError } from '@/errors.ts'
import { ModelInteractionHandler, NewTokenHandler, RateLimitHandler } from './callbacks.ts'
import { cheshireCat } from './index.ts'

type SQLDialect = 'oracle' | 'postgres' | 'sqlite' | 'mysql' | 'mssql'

type ExtractByType<T, K extends string> = T extends { type: infer U }
	? U extends K
		? Omit<T, 'type'>
		: never
	: never

/**
 * The stray kitten goes around tools and hook, making troubles
 */
export class StrayKitten {
	#chatId: string
	#userId: string
	private chatHistory: MemoryMessage[] = []
	private modelsInteractions: ModelInteraction[] = []
	public lastUserMessage: Message | undefined
	public wsQueue: WSMessage[] = []
	public activeForm?: string
	public workingMemory: WorkingMemory = {
		episodic: [],
		declarative: [],
		procedural: [],
	}

	constructor(userId: string, chatId: string, private ws?: WS) {
		this.#userId = userId
		this.#chatId = chatId
	}

	/**
	 * Get the user ID.
	 */
	get userId() {
		return this.#userId
	}

	/**
	 * Get the chat ID.
	 */
	get chatId() {
		return this.#chatId
	}

	/**
	 * Get the current installed plugins.
	 */
	get plugins() {
		return madHatter.installedPlugins
	}

	/**
	 * Get the current instance of the LLM selected.
	 */
	get currentLLM() {
		return cheshireCat.currentLLM
	}

	/**
	 * Get the current instance of the Embedder selected.
	 */
	get currentEmbedder() {
		return cheshireCat.currentEmbedder
	}

	/**
	 * Get the AgentManager instance.
	 */
	get agentManager() {
		return cheshireCat.agentManager
	}

	/**
	 * Get the memory instance.
	 */
	get vectorMemory() {
		return cheshireCat.vectorMemory
	}

	/**
	 * Get the WhiteRabbit instance.
	 */
	get whiteRabbit() {
		return cheshireCat.whiteRabbit
	}

	/**
	 * Get the RabbitHole instance.
	 */
	get rabbitHole() {
		return cheshireCat.rabbitHole
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
	 * @param msg The message to send.
	 */
	async send(msg: WSMessage) {
		if (this.ws) this.ws.send(JSON.stringify(msg))
		else {
			log.warn(`No websocket connection is open for "${this.chatId}". Queuing the message...`)
			this.wsQueue.push(msg)
		}
		await madHatter.executeHook('afterSendMessage', msg, this)
	}

	/**
	 * Retrieves information about a plugin.
	 * @param id The ID of the plugin.
	 * @returns An object containing the plugin's active status, manifest, and settings.
	 *
	 * Returns undefined if the plugin is not found.
	 */
	getPluginInfo<T extends z.AnyZodObject>(id: string) {
		const plugin = madHatter.getPlugin<T>(id)
		if (!plugin) return undefined
		const { active, manifest, settings } = plugin
		return {
			active,
			manifest,
			settings,
		}
	}

	updatePluginSettings<T extends z.AnyZodObject>(id: string, settings: Partial<z.infer<T>>) {
		const plugin = madHatter.getPlugin<T>(id)
		if (!plugin) return undefined
		plugin.settings = settings
	}

	/**
	 * @experimental Classifies the given sentence into one of the provided labels.
	 * @param sentence The sentence to classify.
	 * @param labels An object containing the labels and their corresponding examples.
	 * @returns The label that best matches the sentence.
	 * @throws If no labels are provided.
	 */
	async classify(sentence: string, labels: Record<string, [string, ...string[]]>) {
		if (Object.keys(labels).length === 0) throw new Error('No labels provided for classification.')

		let examplesList = '\nExamples:'
		for (const [label, examples] of Object.entries(labels)) {
			for (const example of examples)
				examplesList += `\n"${example}" -> "${label}"`
		}

		const prompt = `Classify this sentence:
"${sentence}"

Allowed classes are:
"${Object.keys(labels).join('", "')}"
${examplesList}

Just output the class, nothing else.`

		const response = normalizeMessageChunks(await this.llm(prompt))
		const label = closestLevenshtein(response, Object.keys(labels))
		log.info(`Classified sentence: ${label}`)

		return label
	}

	/**
	 * @experimental Executes a SQL query based on a natural language question.
	 * @param question The user question.
	 * @param type The SQL dialect to use.
	 * @param source The data source to execute the query on.
	 * @returns The result of the SQL query in natural language.
	 */
	async queryDb<T extends SQLDialect>(
		question: string,
		type: T,
		source: ExtractByType<DataSourceOptions, T>,
	) {
		const appDataSource = new DataSource({ type, ...source } as DataSourceOptions)
		const db = await SqlDatabase.fromDataSourceParams({ appDataSource })

		const executeQuery = new QuerySqlTool(db)
		const writeQuery = await createSqlQueryChain({ llm: this.currentLLM, db, dialect: type })

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
	 * Processes the user message and returns the response.
	 * @param msg The message to send.
	 * @param save Whether to save the message or not in the chat history (default: true).
	 * @param returnWhy Whether to return the 'why' field in the response (default: true).
	 * @returns The response message.
	 */
	async run(msg: Message, save = true, returnWhy = true): Promise<WSMessage> {
		log.info(`Received message from user "${this.userId}":`)
		log.info(msg)

		const response = this.lastUserMessage = await madHatter.executeHook('beforeReadMessage', msg, this)

		if (!('text' in response)) {
			log.warn('The message does not contain any text. Ignoring it...')
			return {
				type: 'notification',
				content: 'The message does not contain any text. Ignoring it...',
			}
		}

		// FEATURE: Find another way to handle this
		// if (response.text.length > cheshireCat.embedderSize) {
		// 	log.warn(`The input is too long. Storing it as document...`)
		// 	await rabbitHole.ingestContent(this, response.text)
		// 	return {
		// 		type: 'notification',
		// 		content: 'The input is too long. Storing it as document...',
		// 	}
		// }

		if (save) this.addHistory([{ role: 'User', what: response.text, who: this.userId, when: Date.now() }])

		try { await this.recallRelevantMemories() }
		catch (error) {
			log.error(error)
			return {
				type: 'error',
				name: 'MemoryRecallError',
				description: 'An error occurred while trying to recall relevant memories.',
			}
		}

		const [agentError, catMsg = {
			output: 'I am sorry, I could not process your request.',
		}] = await catchError(this.agentManager.executeAgent(this), { logMessage: 'Failed to execute agent.' })

		if (agentError) {
			log.normal('Agent response:')
			log.dir(agentError)
			throw agentError
		}

		let doc = new Document<Record<string, any>>({
			pageContent: response.text,
			metadata: {
				chatId: this.chatId,
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
				interactions: this.getInteractions(),
			},
		}, this)

		if (save) this.addHistory([structuredClone(finalOutput)])

		if (!returnWhy && finalOutput.role === 'AI') delete finalOutput.why

		this.clearInteractions()

		return {
			type: 'chat',
			...finalOutput,
		}
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
	 * @returns the number of messages cleared
	 */
	clearHistory() {
		const msgs = this.chatHistory.length
		if (msgs) log.debug(`Clearing ${msgs} messages from the chat history...`)
		this.chatHistory = []
		return msgs
	}

	/**
	 * Adds messages to the chat history.
	 * @param messages the messages to add
	 */
	addHistory(messages: MemoryMessage[]) {
		this.chatHistory.push(...messages)
	}

	/**
	 * Adds an interaction to the working memory.
	 * @param interaction the interaction to add
	 */
	async addInteraction(interaction: ModelInteraction) {
		this.modelsInteractions.push(interaction)
		await madHatter.executeHook('afterModelInteraction', interaction, this)
	}

	/**
	 * If passed a number k, retrieves the last k interactions in the working memory.
	 * Otherwise, retrieves all interactions in the working memory.
	 * @param k the number of interactions to retrieve
	 * @returns the interactions present in the working memory
	 */
	getInteractions(k?: number) {
		return k ? this.modelsInteractions.slice(-k) : [...this.modelsInteractions]
	}

	/**
	 * Clears the model interactions.
	 */
	clearInteractions() {
		this.modelsInteractions = []
	}

	/**
	 * Recalls relevant memories based on the given query.
	 * If no query is provided, it uses the last user's message text as the query.
	 * @param query The query string to search for relevant memories.
	 */
	async recallRelevantMemories(query = '') {
		if (!query) query = this.lastUserMessage?.text || ''
		if (!query) throw new Error('No query provided and no user message found.')

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
					must: [
						{
							key: 'who',
							match: { any: [this.userId] },
						},
						{
							key: 'chatId',
							match: { any: [this.chatId] },
						},
					],
				},
			},
			episodic: {
				embedding: queryEmbedding,
				k: 3,
				threshold: 0.7,
				filter: {
					must: [
						{
							key: 'who',
							match: { any: [this.userId] },
						},
						{
							key: 'chatId',
							match: { any: [this.chatId] },
						},
					],
				},
			},
			procedural: {
				embedding: queryEmbedding,
				k: 3,
				threshold: 0.7,
			},
		}
		log.info(`Recalled memories for chat: ${this.chatId}`)
		recallConfigs = deepDefaults(await madHatter.executeHook('beforeRecallMemories', recallConfigs, this), recallConfigs)
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
		await madHatter.executeHook('afterRecallMemories', structuredClone(this.workingMemory), this)

		interaction.reply = queryEmbedding
		interaction.endedAt = Date.now()
		await this.addInteraction(interaction)
	}

	/**
	 * Executes the LLM with the given prompt and returns the response.
	 * @param prompt The prompt or messages to be passed to the LLM.
	 * @param stream Optional parameter to enable streaming mode.
	 * @param callbacks Optional callbacks to be passed to the LLM.
	 * @returns The response message or a stream of response messages.
	 */
	llm(prompt: BaseLanguageModelInput, stream?: false, callbacks?: BaseCallbackHandler[]): Promise<AIMessageChunk>
	llm(prompt: BaseLanguageModelInput, stream?: true, callbacks?: BaseCallbackHandler[]): Promise<IterableReadableStream<AIMessageChunk>>
	llm(prompt: BaseLanguageModelInput, stream = false, callbacks: BaseCallbackHandler[] = []): Promise<AIMessageChunk | IterableReadableStream<AIMessageChunk>> {
		if (stream) callbacks.push(new NewTokenHandler(this))

		callbacks.push(new ModelInteractionHandler(this, 'StrayKitten'), new RateLimitHandler(), ...callbacks)

		return cheshireCat.pure(prompt, stream as never, callbacks)
	}
}
