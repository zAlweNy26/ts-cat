import '@total-typescript/ts-reset'

declare module 'nodemon' {
	interface NodemonSettings {
		legacyWatch?: boolean
	}
}

declare global {
	type Nullable<T> = T | null | undefined
	type MaybePromise<T> = T | Promise<T>
	type NotPromise<T> = T extends Promise<any> ? never : T
	type BetterReadonly<T, Deep extends boolean = true> = {
		readonly [Key in keyof T]: Deep extends true
			? T[Key] extends object
				? BetterReadonly<T[Key]>
				: T[Key]
			: T[Key]
	}

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
