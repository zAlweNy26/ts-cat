import type { RawData, WebSocket } from 'ws'
import callsites from 'callsites'
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import { Document } from '@langchain/core/documents'
import { destr } from 'destr'
import { madHatter } from '@mh'
import { log } from '@logger'
import { rabbitHole } from '@rh'
import type { MemoryMessage, MemoryRecallConfigs, Message, WSMessage, WorkingMemory } from '@dto/message.ts'
import type { AgentFastReply } from '@dto/agent.ts'
import { NewTokenHandler } from './callbacks.ts'
import { cheshireCat } from './cheshire-cat.ts'

export class StrayCat {
	private chatHistory: MemoryMessage[] = []
	private _ws?: WebSocket
	private userMessage!: Message
	public wsQueue: WSMessage[] = []
	public activeForm?: string
	public workingMemory: WorkingMemory = {
		episodic: [],
		declarative: [],
		procedural: [],
	}

	constructor(public userId: string, ws?: WebSocket) {
		this._ws = ws
		if (this._ws) this._ws.on('message', this.onMessage)
	}

	private async onMessage(message: RawData) {
		let msg: Message
		try { msg = destr(message.toString()) }
		catch (error) {
			msg = { text: message.toString() }
		}
		const res = await this.run(msg)
		if (res) this.send({ type: 'chat', ...res })
	}

	get lastUserMessage() {
		return this.userMessage
	}

	get ws() {
		return this._ws
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

	/**
	 * Retrieves information about the plugin where is being executed.
	 * @returns An object containing the plugin's active status, manifest, and settings.
	 * Returns undefined if the plugin is not found.
	 */
	getPluginInfo() {
		const paths = callsites().map(site => site.getFileName())
		const folder = paths.find(path => path?.includes('src/plugins/'))
		if (!folder) return undefined
		const match = folder.match(/src\/plugins\/(.+?)\/tmp/)
		if (!match || !match[1]) return undefined
		const id = match[1]
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
	set ws(value: WebSocket | undefined) {
		this._ws = value
		this._ws?.on('open', () => {
			log.info(`User ${this.userId} is now connected to the WebSocket.`)
			while (this.wsQueue.length) {
				const message = this.wsQueue.shift()
				if (message) this.send(message)
			}
		})
		this._ws?.on('message', this.onMessage)
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
	}

	/**
	 * Processes the user message and returns the response.
	 * @param msg The message to send
	 * @param save Whether to save the message or not in the chat history (default: true).
	 * @returns The response message
	 */
	async run(msg: Message, save = true) {
		log.info(`Received message from user "${this.userId}":`)
		log.info(msg)

		const response = this.userMessage = madHatter.executeHook('beforeReadMessage', msg, this)

		// TODO: Find another way to handle this
		if (response.text.length > cheshireCat.embedderSize) {
			log.warn(`The input is too long. Storing it as document...`)
			await rabbitHole.ingestContent(this, response.text)
			return
		}

		try { await this.recallRelevantMemories() }
		catch (error) {
			log.error(error)
			return
		}

		let catMsg: AgentFastReply
		try {
			catMsg = await cheshireCat.currentAgentManager.executeAgent(this)
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
		doc = madHatter.executeHook('beforeStoreEpisodicMemory', doc, this)
		const docEmbedding = await cheshireCat.currentEmbedder.embedDocuments([response.text])
		if (docEmbedding.length === 0) throw new Error('Could not embed the document.')
		await cheshireCat.currentMemory.collections.episodic.addPoint(doc.pageContent, docEmbedding[0]!, doc.metadata)

		let finalOutput: MemoryMessage = {
			role: 'AI',
			what: catMsg.output,
			who: this.userId,
			when: Date.now(),
			why: {
				input: response.text,
				intermediateSteps: catMsg.intermediateSteps ?? [],
				memory: this.workingMemory,
			},
		}

		finalOutput = madHatter.executeHook('beforeSendMessage', finalOutput, this)

		if (save) {
			this.chatHistory.push({ role: 'User', what: response.text, who: this.userId, when: Date.now() })
			this.chatHistory.push(finalOutput)
		}

		return finalOutput
	}

	/**
	 * Classifies the given sentence into one of the provided labels.
	 * @param sentence The sentence to classify
	 * @param labels The labels to classify the sentence into
	 * @param examples Optional examples to help the LLM classify the sentence
	 * @returns The label of the sentence or null if it could not be classified
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

		const response = await this.llm(prompt)
		log.info(`Classified sentence: ${response}`)

		const label = labels.find(w => response.includes(w))
		if (label) return label
		else return null
	}

	/**
	 * If passed a number k, retrieves the last k messages in the working memory.
	 * Otherwise, retrieves all messages in the working memory.
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
	 * Recalls relevant memories based on the given query.
	 * If no query is provided, it uses the last user's message text as the query.
	 * @param query The query string to search for relevant memories.
	 */
	async recallRelevantMemories(query?: string) {
		if (!query) query = this.userMessage.text

		query = madHatter.executeHook('recallQuery', query, this)
		log.info(`Recall query: ${query}`)

		const queryEmbedding = await cheshireCat.currentEmbedder.embedQuery(query)
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
			...madHatter.executeHook('beforeRecallMemories', recallConfigs, this),
		}
		for (const [key, value] of Object.entries(recallConfigs)) {
			const memories = await cheshireCat.currentMemory.collections[key]?.recallMemoriesFromEmbedding(
				value.embedding,
				value.filter,
				value.k,
				value.threshold,
			) ?? []
			log.info(`Recalled ${memories.length} memories for ${key} collection.`)
			this.workingMemory[key] = memories
		}
		madHatter.executeHook('afterRecallMemories', this)
	}

	/**
	 * Executes the LLM with the given prompt and returns the response.
	 * @param prompt The prompt to be passed to the LLM.
	 * @param stream Optional parameter to enable streaming mode.
	 */
	llm(prompt: string, stream = false): Promise<string> {
		const callbacks: BaseCallbackHandler[] = []
		if (stream) callbacks.push(new NewTokenHandler(this))
		return this.currentLLM.invoke(prompt, { callbacks })
	}
}
