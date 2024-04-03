import { JSONFileSyncPreset } from 'lowdb/node'
import type { HookTypes } from '@hook'

export interface DatabaseConfig {
	selectedLLM: string
	selectedEmbedder: string
	llms: {
		name: string
		value: Record<string, any>
	}[]
	embedders: {
		name: string
		value: Record<string, any>
	}[]
	activeHooks: Partial<{ [K in keyof HookTypes]: string[] }>
	activePlugins: string[]
	activeTools: string[]
	activeForms: string[]
	[key: string]: any
}

const db = JSONFileSyncPreset<DatabaseConfig>('./data/metadata.json', {
	selectedLLM: 'DefaultLLM',
	selectedEmbedder: 'FakeEmbedder',
	llms: [
		{ name: 'DefaultLLM', value: {} },
	],
	embedders: [
		{ name: 'FakeEmbedder', value: {} },
	],
	activeHooks: {},
	activeForms: [],
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
