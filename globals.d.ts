import '@total-typescript/ts-reset'

declare global {
	type TODO = any

	namespace NodeJS {
		interface ProcessEnv {
			CORE_HOST?: string
			CORE_PORT?: string
			CORE_USE_SECURE_PROTOCOLS?: string
			QDRANT_HOST?: string
			QDRANT_PORT?: string
			QDRANT_API_KEY?: string
			API_KEY?: string
			CORS_ALLOWED_ORIGINS?: string
			LOG_LEVEL?: string
			SAVE_MEMORY_SNAPSHOTS?: string
		}
	}
}

export { }
