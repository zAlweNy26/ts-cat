import _CloneDeepWith from 'lodash/cloneDeepWith.js'
import { LowSync } from 'lowdb'
import { DataFileSync } from 'lowdb/node'
import { z } from 'zod'
import { deepDefaults, getZodDefaults } from './utils'

const defaultDbKeys = z.object({
	instantTool: z.boolean().default(true),
	selectedLLM: z.string().default('FakeChat'),
	selectedEmbedder: z.string().default('FakeEmbeddings'),
	chunkSize: z.number().default(256),
	chunkOverlap: z.number().default(64),
	rateLimiter: z.object({
		enabled: z.boolean().default(false),
		checkInterval: z.number().default(1),
		maxBucketSize: z.number().default(1000),
		tokensPerSecond: z.number().default(1000),
	}),
	cache: z.object({
		enabled: z.boolean().default(true),
		redisUrl: z.string().url().optional(),
	}),
	llms: z.array(z.object({
		name: z.string(),
		value: z.record(z.any()),
	})).default([{ name: 'FakeChat', value: {} }]),
	embedders: z.array(z.object({
		name: z.string(),
		value: z.record(z.any()),
	})).default([{ name: 'FakeEmbeddings', value: {} }]),
	activePlugins: z.set(z.string()).default(new Set(['core_plugin'])),
	activeTools: z.set(z.string()).default(new Set()),
	activeForms: z.set(z.string()).default(new Set()),
}).passthrough()

const dbConfig = defaultDbKeys.refine(({ llms, embedders, selectedEmbedder, selectedLLM }) => {
	return llms.some(l => l.name === selectedLLM) && embedders.some(e => e.name === selectedEmbedder)
})

export type DatabaseConfig = z.infer<typeof dbConfig>

class JSONFileSync extends DataFileSync<DatabaseConfig> {
	constructor(filename: string) {
		super(filename, {
			parse: data => JSON.parse(data, (k, v) => {
				if (Array.isArray(v)
					&& ['activePlugins', 'activeTools', 'activeForms'].includes(k)) return new Set(v)
				return v
			}) as DatabaseConfig,
			stringify: data => JSON.stringify(_CloneDeepWith(data, (v) => {
				if (v instanceof Set) return [...v]
				if (v instanceof Map) return Object.fromEntries(v)
			}), null, 2),
		})
	}
}

export class Database {
	private static instance: Database
	private _db: LowSync<DatabaseConfig>

	private constructor(path: string) {
		this._db = new LowSync(new JSONFileSync(path), getZodDefaults(defaultDbKeys)!)
		this._db.read()
		this._db.data = deepDefaults(this._db.data, getZodDefaults(defaultDbKeys))
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
}

export const db = Database.init('./data/metadata.json')
