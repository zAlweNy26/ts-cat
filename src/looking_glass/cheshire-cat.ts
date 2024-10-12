import type { PointData } from '@dto/vector-memory.ts'
import type { Embeddings } from '@langchain/core/embeddings'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { rabbitHole } from '@/rabbit-hole.ts'
import { db } from '@db'
import { getEmbedder, getLLM } from '@factory'
import { log } from '@logger'
import { getVectorMemory, type VectorMemory } from '@memory'
import { type Form, isForm, isTool, madHatter, type Tool } from '@mh'
import { AgentManager } from './agent-manager.ts'
import { StrayCat, type WS } from './stray-cat.ts'
import { whiteRabbit } from './white-rabbit.ts'

type ProcedureHash = Record<string, {
	name: string
	content: string
	type: 'tool' | 'form'
	trigger: 'startExample' | 'stopExample' | 'description'
}>

export class CheshireCat {
	private static instance: CheshireCat
	private llm!: BaseChatModel
	private embedder!: Embeddings
	private memory!: VectorMemory
	private manager: AgentManager
	private strays = new Map<string, StrayCat>()
	private _embedderSize = 0

	private constructor() {
		log.silent('Initializing the Cheshire Cat...')
		db.update(db => madHatter.executeHook('beforeBootstrap', db))
		this.loadNaturalLanguage()
		madHatter.onPluginsSyncCallback = () => this.embedProcedures()
		this.manager = new AgentManager()
	}

	/**
	 * Get the Cheshire Cat instance
	 * @returns The Cheshire Cat class as a singleton
	 */
	static async getInstance() {
		if (!CheshireCat.instance) {
			CheshireCat.instance = new CheshireCat()
			await CheshireCat.instance.loadMemory()
			await CheshireCat.instance.embedProcedures()
			db.update(db => madHatter.executeHook('afterBootstrap', db, CheshireCat.instance))
		}
		return CheshireCat.instance
	}

	get currentLLM() {
		return this.llm
	}

	get currentEmbedder() {
		return this.embedder
	}

	get agentManager() {
		return this.manager
	}

	get vectorMemory() {
		return this.memory
	}

	get whiteRabbit() {
		return whiteRabbit
	}

	get rabbitHole() {
		return rabbitHole
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
	addStray(userId: string, ws?: WS) {
		this.strays.set(userId, new StrayCat(userId, ws))
		return this.getStray(userId)!
	}

	/**
	 * Removes a stray instance for the specified user from the collection.
	 * @param userId The ID of the user to remove.
	 * @returns True if the user was successfully removed, false otherwise.
	 */
	removeStray(userId: string) {
		return this.strays.delete(userId)
	}

	/**
	 * Load the Large Language Model (LLM) and the Embedder from the database.
	 * If the selected LLM or Embedder is not found, it falls back to the default one.
	 */
	loadNaturalLanguage() {
		this.llm = this.loadLanguageModel()
		this.embedder = this.loadLanguageEmbedder()
	}

	private loadLanguageModel() {
		const selected = db.data.selectedLLM
		try {
			const llm = getLLM(selected)
			if (!llm) throw new Error('LLM not found')
			const settings = db.getLLMSettings(selected)
			if (!settings) throw new Error('LLM settings not found')
			return llm.initModel(settings)
		}
		catch (error) {
			log.error(error)
			log.warn(`The selected LLM "${selected}" does not exist. Falling back to the default LLM.`)
			return getLLM('FakeChat')!.initModel({})
		}
	}

	private loadLanguageEmbedder() {
		const selected = db.data.selectedEmbedder
		try {
			const embedder = getEmbedder(selected)
			if (!embedder) throw new Error('Embedder not found')
			const settings = db.getEmbedderSettings(selected)
			if (!settings) throw new Error('Embedder settings not found')
			return embedder.initModel(settings)
		}
		catch (error) {
			log.error(error)
			log.warn(`The selected Embedder "${selected}" does not exist. Falling back to the default Embedder.`)
			return getEmbedder('FakeEmbeddings')!.initModel({})
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
		this.memory = await getVectorMemory({
			embedderName: db.data.selectedEmbedder,
			embedderSize: this.embedderSize,
		})
	}

	private buildEmbeddedProceduresHashes(procedures: PointData[]) {
		const hashes: Record<string, string> = {}
		for (const proc of procedures) {
			const metadata = proc.payload?.metadata as Record<string, any>
			const pageContent = (proc.payload?.pageContent as string).toLowerCase().replace(/\s/g, '_')
			const description = metadata.trigger === 'description' ? '' : `.${pageContent ?? 'empty'}`
			const hash = `${metadata.source ?? 'unknown'}.${metadata.trigger ?? 'unsupported'}${description}`
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
