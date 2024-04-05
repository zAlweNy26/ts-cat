import type { RawData, WebSocket } from 'ws'
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import type { DocumentInput } from '@langchain/core/documents'
import { Document } from '@langchain/core/documents'
import type { ChainValues } from 'langchain/schema'
import { destr } from 'destr'
import { madHatter } from '@mh'
import type { EmbeddedVector, FilterMatch } from '@memory'
import type { Message } from '@utils'
import { log } from '@logger'
import { rabbitHole } from '@rh'
import type { AgentFastReply } from './agent-manager.ts'
import { NewTokenHandler } from './callbacks.ts'
import { cheshireCat } from './cheshire-cat.ts'

export interface MemoryRecallConfig {
	embedding: number[]
	k: number
	threshold: number
	filter?: Record<string, FilterMatch>
}

export interface MemoryRecallConfigs {
	episodic: MemoryRecallConfig
	declarative: MemoryRecallConfig
	procedural: MemoryRecallConfig
	[key: string]: MemoryRecallConfig
}

export type MemoryDocument = {
	id: string
	vector: EmbeddedVector
	score: number
} & DocumentInput

export interface WorkingMemory {
	episodic: MemoryDocument[]
	declarative: MemoryDocument[]
	procedural: MemoryDocument[]
	[key: string]: MemoryDocument[]
}

export interface MemoryMessage {
	what: string
	who: string
	when: number
	why?: {
		input: string
		intermediateSteps: Record<string, any>[]
		memory?: WorkingMemory
	}
}

type WSMessage = {
	type: 'error'
	name: string
	description: string
} | {
	type: 'token' | 'notification'
	content: string
} | ({ type: 'chat' } & MemoryMessage)

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
		if (this._ws) { this._ws.on('message', this.onMessage) }
	}

	private async onMessage(message: RawData) {
		let msg: Message
		try { msg = destr(message.toString()) }
		catch (error) {
			msg = { text: message.toString() }
		}
		const res = await this.run(msg)
		if (res) { this.send({ type: 'chat', ...res }) }
	}

	get lastUserMessage() {
		return this.userMessage
	}

	get ws() {
		return this._ws
	}

	get currentLLM() {
		return cheshireCat.currentLLM
	}

	set ws(value: WebSocket | undefined) {
		this._ws = value
		this._ws?.on('open', () => {
			log.info(`User ${this.userId} is now connected to the WebSocket.`)
			while (this.wsQueue.length) {
				const message = this.wsQueue.shift()
				if (message) { this.send(message) }
			}
		})
		this._ws?.on('message', this.onMessage)
	}

	/**
	 * Sends a message through the websocket connection.
	 * If the websocket connection is not open, the message is queued.
	 * @param message The message to send.
	 */
	send(message: WSMessage) {
		if (this.ws) {
			const what = JSON.stringify(message)
			this.chatHistory.push({ what, who: this.userId, when: Date.now() })
			this.ws.send(what)
		}
		else {
			log.warn(`No websocket connection is open for user "${this.userId}". Queuing the message...`)
			this.wsQueue.push(message)
		}
	}

	/**
	 * Processes the user message and returns the response.
	 * @param msg the user message
	 * @param save whether to save the message or not in the chat history. Default is true.
	 * @returns the response message
	 */
	async run(msg: Message, save = true) {
		log.info(`Received message from user "${this.userId}":`)
		log.info(msg)
		const response = this.userMessage = madHatter.executeHook('beforeReadMessage', msg, this)
		if (response.text.length > cheshireCat.embedderSize) {
			log.warn(`The input is too long. Storing it as document...`)
			rabbitHole.ingestContent(this, response.text)
			return
		}

		try {
			await this.recallRelevantMemories()
		}
		catch (error) {
			log.error(error)
			return
		}

		let catMsg: ChainValues
		try {
			catMsg = await cheshireCat.currentAgentManager.executeAgent(this)
		}
		catch (error) {
			log.error(error)
			catMsg = {
				intermediateSteps: [],
				output: 'I am sorry, I could not process your request.',
			} satisfies AgentFastReply
		}

		log.info('Agent response:')
		log.info(catMsg)

		let doc = new Document({
			pageContent: response.text,
			metadata: {
				who: this.userId,
				when: Date.now(),
			},
		}) as Document<Record<string, any>>
		doc = madHatter.executeHook('beforeStoreEpisodicMemory', doc, this)
		const docEmbedding = await cheshireCat.currentEmbedder.embedDocuments([response.text])
		if (docEmbedding.length === 0) { throw new Error('Could not embed the document.') }
		await cheshireCat.currentMemory.collections.episodic.addPoint(doc.pageContent, docEmbedding[0]!, doc.metadata)

		let finalOutput: MemoryMessage = {
			what: catMsg.output,
			who: 'AI',
			when: Date.now(),
			why: {
				input: response.text,
				intermediateSteps: catMsg.intermediateSteps ?? [],
				memory: this.workingMemory,
			},
		}

		finalOutput = madHatter.executeHook('beforeSendMessage', finalOutput, this)

		if (save) {
			this.chatHistory.push({ what: response.text, who: 'Human', when: Date.now() })
			this.chatHistory.push(finalOutput)
		}

		return finalOutput
	}

	/**
	 * If passed a number k, retrieves the last k messages in the working memory.
	 * Otherwise, retrieves all messages in the working memory.
	 * @param k the number of messages to retrieve
	 * @returns the messages present in the chat history
	 */
	getHistory(k?: number) {
		return k ? this.chatHistory.slice(-k) : this.chatHistory
	}

	clearHistory() {
		this.chatHistory = []
	}

	async recallRelevantMemories(query?: string) {
		if (!query) { query = this.userMessage.text }

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
			)
			this.workingMemory[key] = memories ?? []
		}
		madHatter.executeHook('afterRecallMemories', this)
	}

	llm(prompt: string, stream = false): Promise<string> {
		const callbacks: BaseCallbackHandler[] = []
		if (stream) { callbacks.push(new NewTokenHandler(this)) }
		return this.currentLLM.invoke(prompt, { callbacks })
	}
}
