import type { WebSocket } from 'ws'
import type { Embeddings } from '@langchain/core/embeddings'
import type { BaseLanguageModel } from '@langchain/core/language_models/base'
import { getEmbedder, getLLM } from '@factory'
import { type Form, type Tool, isForm, isTool, madHatter } from '@mh'
import { type VectorMemory, getVectorMemory } from '@memory'
import { db } from '@db'
import { log } from '@logger'
import type { PointData } from '@dto/vector-memory.ts'
import { AgentManager } from './agent-manager.ts'
import { StrayCat } from './stray-cat.ts'

type ProcedureHash = Record<string, {
	name: string
	content: string
	type: 'tool' | 'form'
	trigger: 'startExample' | 'stopExample' | 'description'
}>

export class CheshireCat {
	private static instance: CheshireCat
	private llm: BaseLanguageModel
	private embedder: Embeddings
	private memory!: VectorMemory
	private agentManager: AgentManager
	private strays = new Map<string, StrayCat>()
	private _embedderSize = 0

	private constructor() {
		madHatter.executeHook('beforeBootstrap', this)
		this.llm = this.loadLanguageModel()
		this.embedder = this.loadLanguageEmbedder()
		madHatter.onPluginsSyncCallback = () => this.embedProcedures()
		this.agentManager = new AgentManager()
		madHatter.executeHook('afterBootstrap', this)
	}

	/**
	 * Get the Cheshire Cat instance
	 * @returns The Cheshire Cat class as a singleton
	 */
	static async getInstance() {
		if (!CheshireCat.instance) {
			log.silent('Initializing the Cheshire Cat...')
			CheshireCat.instance = new CheshireCat()
			await CheshireCat.instance.loadMemory()
			await CheshireCat.instance.embedProcedures()
		}
		return CheshireCat.instance
	}

	get currentLLM() {
		return this.llm
	}

	get currentEmbedder() {
		return this.embedder
	}

	get currentAgentManager() {
		return this.agentManager
	}

	get currentMemory() {
		return this.memory
	}

	get embedderSize() {
		return this._embedderSize
	}

	/**
	 * Get the StrayCat instance associated with the given userId.
	 * @param userId The unique identifier of the stray cat.
	 * @returns The StrayCat instance associated with the given userId.
	 */
	getStray(userId: string) {
		return this.strays.get(userId)
	}

	/**
	 * Add a StrayCat with the given userId to the collection of strays.
	 * @param userId The unique identifier of the stray cat.
	 * @returns The StrayCat instance associated with the given userId.
	 */
	addStray(userId: string, ws?: WebSocket) {
		this.strays.set(userId, new StrayCat(userId, ws))
		return this.getStray(userId)!
	}

	/**
	 * Get the Large Language Model (LLM) settings at bootstrap time.
	 * @returns The found LLM settings from db or the default LLM settings
	 */
	loadLanguageModel() {
		const selected = db.data.selectedLLM, settings = db.getLLMSettings()
		try {
			const llm = getLLM(selected)
			if (!llm) throw new Error('LLM not found')
			if (!settings) throw new Error('LLM settings not found')
			return llm.getModel(settings)
		}
		catch (error) {
			log.error(`The selected LLM "${selected}" does not exist. Falling back to the default LLM.`)
			return getLLM('DefaultLLM')!.getModel({})
		}
	}

	/**
	 * Get the Embedder settings at bootstrap time.
	 * @returns The found Embedder settings from db or the default LLM settings
	 */
	loadLanguageEmbedder() {
		const selected = db.data.selectedEmbedder, embSettings = db.getEmbedderSettings(), llmSettings = db.getLLMSettings()
		try {
			if (!llmSettings) throw new Error('LLM settings not found')
			const embedder = getEmbedder(selected)
			if (!embedder) throw new Error('Embedder not found')
			if (!embSettings && embedder.name !== 'FakeEmbedder') throw new Error('Embedder settings not found')
			return embedder.getModel(embSettings ?? {})
		}
		catch (error) {
			log.error(`The selected Embedder "${selected}" does not exist. Falling back to the default Embedder.`)
			return getEmbedder('FakeEmbedder')!.getModel({})
		}
	}

	/**
	 * Loads the long term memory from the database.
	 */
	async loadMemory() {
		log.info('Loading memory...')
		this._embedderSize = (await this.currentEmbedder.embedQuery('hello world')).length
		if (this._embedderSize === 0) {
			log.error('Embedder size is 0')
			throw new Error('Embedder size is 0. Unable to proceed.')
		}
		const vectorMemoryConfig = {
			embedderName: db.data.selectedEmbedder,
			embedderSize: this.embedderSize,
		}
		this.memory = await getVectorMemory(vectorMemoryConfig)
	}

	private buildEmbeddedProceduresHashes(procedures: PointData[]) {
		const hashes: Record<string, string> = {}
		for (const proc of procedures) {
			const metadata = proc.payload?.metadata as Record<string, any>
			const pageContent = (proc.payload?.pageContent as string).toLowerCase().replace(/\s/g, '_')
			const hasDescription = metadata.trigger === 'description' ? '' : `.${pageContent ?? 'empty'}`
			const hash = `${metadata.source ?? 'unknown'}.${metadata.trigger ?? 'unsupported'}${hasDescription}`
			hashes[hash] = proc.id.toString()
		}
		return hashes
	}

	private buildActiveProceduresHashes(procedures: (Tool | Form)[]) {
		const hashes: ProcedureHash = {}
		for (const proc of procedures) {
			hashes[`${proc.name}.description`] = {
				name: proc.name,
				content: proc.description,
				type: isTool(proc) ? 'tool' : 'form',
				trigger: 'description',
			}
			for (const example of proc.startExamples) {
				hashes[`${proc.name}.startExample.${example.toLowerCase().replace(/\s/g, '_')}`] = {
					name: proc.name,
					content: example,
					type: isTool(proc) ? 'tool' : 'form',
					trigger: 'startExample',
				}
			}
			if (isForm(proc)) {
				for (const example of proc.stopExamples) {
					hashes[`${proc.name}.stopExample.${example.toLowerCase().replace(/\s/g, '_')}`] = {
						name: proc.name,
						content: example,
						type: 'form',
						trigger: 'stopExample',
					}
				}
			}
		}
		return hashes
	}

	/**
	 * Embed tools and forms into the memory.
	 */
	async embedProcedures() {
		log.info('Embedding procedures...')
		const embeddedProcedures = await this.memory.collections.procedural.getAllPoints()
		const embProcHashes = this.buildEmbeddedProceduresHashes(embeddedProcedures)
		const actProcHashes = this.buildActiveProceduresHashes([...madHatter.tools, ...madHatter.forms])

		const pointsToDel = Object.keys(embProcHashes).filter(x => !Object.keys(actProcHashes).includes(x))
		const pointsToAdd = Object.keys(actProcHashes).filter(x => !Object.keys(embProcHashes).includes(x))

		const pointsToDelIds = pointsToDel.map(p => embProcHashes[p]!)
		if (pointsToDelIds.length > 0) {
			log.info(`Deleting ${pointsToDelIds.length} procedures triggers...`)
			await this.memory.collections.procedural.deletePoints(pointsToDelIds)
		}

		const activeTriggersToEmbed = pointsToAdd.map(p => actProcHashes[p]!)
		for (const t of activeTriggersToEmbed) {
			const triggerEmbedding = await this.embedder.embedDocuments([t.content])
			if (triggerEmbedding.length === 0) {
				log.error(`Could not embed ${t.type} trigger "${t.trigger}" of "${t.name}" with content: ${t.content}`)
				continue
			}
			this.memory.collections.procedural.addPoint(t.content, triggerEmbedding[0]!, {
				source: t.name,
				type: t.type,
				trigger: t.trigger,
				when: Date.now(),
			})
			log.info(`Embedded ${t.type} trigger "${t.trigger}" of "${t.name}" with content: ${t.content}`)
		}

		log.info('Finished embedding procedures.')
	}
}

export const cheshireCat = await CheshireCat.getInstance()
