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
})

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
	activePlugins: ['core_plugin'],
})

db.read()

export const getDb = () => structuredClone(db.data)

export function updateDb(fn: (db: DatabaseConfig) => void) {
	db.update(fn)
	db.read()
}

export function getLLMSettings(llm?: string) {
	llm ||= db.data.selectedLLM
	return db.data.llms.find(l => l.name === llm)?.value
}

export function getEmbedderSettings(emb?: string) {
	emb ||= db.data.selectedEmbedder
	return db.data.embedders.find(e => e.name === emb)?.value
}
