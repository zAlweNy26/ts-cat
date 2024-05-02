import { defu } from 'defu'
import { JSONFileSyncPreset } from 'lowdb/node'
import { z } from 'zod'

const defaultDbKeys = z.object({
	instantTool: z.boolean(),
	selectedLLM: z.string(),
	selectedEmbedder: z.string(),
	chunkSize: z.number(),
	chunkOverlap: z.number(),
	llms: z.array(z.object({
		name: z.string(),
		value: z.record(z.any()),
	})),
	embedders: z.array(z.object({
		name: z.string(),
		value: z.record(z.any()),
	})),
	activePlugins: z.array(z.string()),
	activeTools: z.array(z.string()),
	activeForms: z.array(z.string()),
}).passthrough()

const dbConfig = defaultDbKeys.refine(({ llms, embedders, selectedEmbedder, selectedLLM }) => {
	return llms.some(l => l.name === selectedLLM) && embedders.some(e => e.name === selectedEmbedder)
})

type DatabaseConfig = z.infer<typeof dbConfig>

export class Database {
	private static instance: Database
	private _db: ReturnType<typeof JSONFileSyncPreset<DatabaseConfig>>

	private constructor(path: string) {
		this._db = JSONFileSyncPreset<DatabaseConfig>(path, {
			instantTool: true,
			selectedLLM: 'DefaultLLM',
			selectedEmbedder: 'FakeEmbedder',
			chunkSize: 256,
			chunkOverlap: 64,
			llms: [
				{ name: 'DefaultLLM', value: {} },
			],
			embedders: [
				{ name: 'FakeEmbedder', value: {} },
			],
			activeTools: [],
			activeForms: [],
			activePlugins: ['core_plugin'],
		})
		this._db.read()
		this._db.write()
	}

	/**
	 * Initializes the database with the specified path.
	 * @param path The path to the database.
	 * @returns The initialized database instance.
	 */
	static init(path: string) {
		if (!Database.instance) Database.instance = new Database(path)
		return Database.instance
	}

	/**
	 * Gets the schema of the default keys of the database.
	 */
	get keys() {
		return defaultDbKeys
	}

	/**
	 * Gets the database object.
	 * @returns A deep clone of the database data.
	 */
	get data() {
		return structuredClone(this._db.data)
	}

	/**
	 * Parses the given data.
	 * @param data The data to be parsed.
	 * @returns The safely parsed data.
	 */
	parse(data: DatabaseConfig) {
		return dbConfig.safeParse(data)
	}

	/**
	 * Updates the database configuration and reads the updated configuration.
	 * @param fn A function that takes the current database configuration as a parameter and updates it.
	 */
	update(fn: (db: DatabaseConfig) => void) {
		this._db.update(fn)
		this._db.read()
	}

	/**
	 * Deletes a key-value pair from the database.
	 * @param key The key of the pair to delete.
	 */
	delete(key: string) {
		this.update((db) => {
			delete db[key]
		})
	}

	/**
	 * Retrieves the LLM settings based on the LLM name.
	 * @param llm The name of the LLM. If not provided, the selected LLM will be used.
	 * @returns The LLM settings if found, otherwise undefined.
	 */
	getLLMSettings(llm?: string) {
		llm ||= this._db.data.selectedLLM
		return this._db.data.llms.find(l => l.name === llm)?.value
	}

	/**
	 * Retrieves the embedder settings based on the embedder name.
	 * @param emb The name of the embedder. If not provided, the selected embedder will be used.
	 * @returns The embedder settings if found, otherwise undefined.
	 */
	getEmbedderSettings(emb?: string) {
		emb ||= this._db.data.selectedEmbedder
		return this._db.data.embedders.find(e => e.name === emb)?.value
	}
}

export const db = Database.init('./data/metadata.json')
