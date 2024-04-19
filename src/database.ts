import { JSONFileSyncPreset } from 'lowdb/node'
import { z } from 'zod'

export const defaultDbKeys = z.object({
	instantTool: z.boolean(),
	selectedLLM: z.string(),
	selectedEmbedder: z.string(),
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

export const dbConfig = z.intersection(defaultDbKeys, z.record(z.any())).refine(({ llms, embedders, selectedEmbedder, selectedLLM }) => {
	return llms.some(l => l.name === selectedLLM) && embedders.some(e => e.name === selectedEmbedder)
})

export type DatabaseConfig = z.infer<typeof dbConfig>

const db = JSONFileSyncPreset<DatabaseConfig>('./data/metadata.json', {
	instantTool: true,
	selectedLLM: 'DefaultLLM',
	selectedEmbedder: 'FakeEmbedder',
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

db.read()

/**
 * Retrieves a deep copy of the database.
 */
export const getDb = () => structuredClone(db.data)

/**
 * Updates the database configuration and reads the updated configuration.
 * @param fn A function that takes the current database configuration as a parameter and updates it.
 */
export function updateDb(fn: (db: DatabaseConfig) => void) {
	db.update(fn)
	db.read()
}

/**
 * Retrieves the LLM settings based on the LLM name.
 * @param llm The name of the LLM. If not provided, the selected LLM will be used.
 * @returns The LLM settings if found, otherwise undefined.
 */
export function getLLMSettings(llm?: string) {
	llm ||= db.data.selectedLLM
	return db.data.llms.find(l => l.name === llm)?.value
}

/**
 * Retrieves the embedder settings based on the embedder name.
 * @param emb The name of the embedder. If not provided, the selected embedder will be used.
 * @returns The embedder settings if found, otherwise undefined.
 */
export function getEmbedderSettings(emb?: string) {
	emb ||= db.data.selectedEmbedder
	return db.data.embedders.find(e => e.name === emb)?.value
}
