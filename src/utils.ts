import type { BaseMessageChunk } from '@langchain/core/messages'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { safeDestr } from 'destr'
import { type CriteriaLike, loadEvaluator } from 'langchain/evaluation'
import _DefaultsDeep from 'lodash/defaultsDeep.js'
import { z } from 'zod'

export const LogLevel = ['error', 'warning', 'normal', 'info', 'debug'] as const

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])

type Literal = z.infer<typeof literalSchema>

export type Json = Literal | { [key: string]: Json } | Json[]

export type Primitive = string | number | boolean | bigint | symbol | { [key: string]: Primitive }

/**
 * A Zod schema for JSON objects.
 */
export const zodJson: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(zodJson), z.record(zodJson)]),
)

/**
 * A Zod schema for primitive values.
 */
export const zodPrimitive: z.ZodType<Primitive> = z.lazy(() =>
	z.union([z.string(), z.number(), z.boolean(), z.bigint(), z.symbol(), z.record(zodPrimitive)]),
)

/**
 * A Zod schema for fixing coercion of boolean value.
 */
export const zodBoolean = z.string().transform(v => v === 'true').default('false')

const envSchema = z.object({
	CORE_HOST: z.string().default('localhost'),
	CORE_PORT: z.coerce.number().default(1865),
	CORE_USE_SECURE_PROTOCOLS: zodBoolean,
	QDRANT_HOST: z.string().default('localhost'),
	QDRANT_PORT: z.coerce.number().default(6333),
	QDRANT_API_KEY: z.string().optional(),
	REDIS_URL: z.string().optional(),
	API_KEY: z.string().optional(),
	CORS_ALLOWED_ORIGINS: z.string().transform(v => v.split(',')).default('*'),
	LOG_LEVEL: z.preprocess(v => String(v).toLowerCase(), z.enum(LogLevel).default('normal')).default(LogLevel[2]),
	SAVE_MEMORY_SNAPSHOTS: zodBoolean,
	WATCH: zodBoolean,
	CACHE: zodBoolean,
}).transform(s => ({
	host: s.CORE_HOST,
	port: s.CORE_PORT,
	secure: s.CORE_USE_SECURE_PROTOCOLS,
	qdrantHost: s.QDRANT_HOST,
	qdrantPort: s.QDRANT_PORT,
	qdrantApiKey: s.QDRANT_API_KEY,
	apiKey: s.API_KEY,
	corsAllowedOrigins: s.CORS_ALLOWED_ORIGINS,
	logLevel: s.LOG_LEVEL,
	saveMemorySnapshots: s.SAVE_MEMORY_SNAPSHOTS,
	watch: s.WATCH,
	redisUrl: s.REDIS_URL,
	cache: s.CACHE,
	verbose: LogLevel.indexOf(s.LOG_LEVEL) > LogLevel.indexOf(LogLevel[2]),
}))

/**
 * The parsed environment variables.
 */
export const parsedEnv = envSchema.parse(process.env)

/**
 * Retrieves the base URL of the application.
 */
function getBaseUrl() {
	const protocol = parsedEnv.secure ? 'https' : 'http'
	const address = `${protocol}://${parsedEnv.host}${parsedEnv.port ? `:${parsedEnv.port}` : ''}`
	return new URL(address)
}

/**
 * It contains various paths and URLs used in the application.
 */
export const catPaths = {
	/**
	 * The base path of the application.
	 */
	basePath: 'src',
	/**
	 * The base URL of the application.
	 */
	baseUrl: getBaseUrl().href,
	/**
	 * The path to the plugins directory.
	 */
	pluginsPath: join('src', 'plugins'),
	/**
	 * The path to the assets directory.
	 */
	assetsPath: join('src', 'assets'),
	/**
	 * The URL to the assets directory.
	 */
	assetsUrl: `${getBaseUrl().href}assets`,
}

/**
 * Logs a welcome message and prints important URLs.
 */
export async function logWelcome() {
	const cat = await Bun.file('src/welcome.txt').text()
	console.log(cat)
	console.log('===================== ^._.^ =====================')
	console.log(`WEBSOCKET: ${getBaseUrl().href.replace('http', 'ws')}ws`)
	console.log(`REST API:  ${getBaseUrl().href}docs`)
	// console.log(`ADMIN:     ${getBaseUrl().href}admin`)
	console.log('=================================================')
}

/**
 * Compares two strings using an evaluator.
 * @param input The input string to compare.
 * @param prediction The prediction string to use for comparison.
 * @param criteria Optional criteria for the evaluator.
 * @returns The score of the comparison. 0 means the strings are identical.
 */
export async function compareStrings(input: string, prediction: string, criteria?: CriteriaLike) {
	const evaluator = await loadEvaluator('embedding_distance', { distanceMetric: 'cosine', criteria })
	const res = await evaluator.evaluateStrings({ input, prediction })
	return (res.score as number) ?? 1
}

/**
 * Merges the properties of the source objects into the target object, recursively applying defaults.
 * @param target The target object to apply defaults to.
 * @param sources The source objects containing default values.
 * @returns A new object with the merged properties.
 */
export function deepDefaults<T>(target: T, ...sources: any[]) {
	return _DefaultsDeep(structuredClone(target), ...sources) as T
}

/**
 * Normalizes the content of a message chunk.
 * @param chunk The message chunk to normalize.
 * @returns The normalized text content as a string.
 */
export function normalizeMessageChunks(chunk: BaseMessageChunk) {
	const { content } = chunk
	if (typeof content === 'string') return content
	else return content.reduce((acc, c) => c.type === 'text' ? acc + c.text : acc, '')
}

/**
 * Checks if a directory exists.
 * @param path The path to the directory to check.
 */
// TODO: Wait for a Bun internal method to be implemented
export async function existsDir(path: string) {
	const glob = new Bun.Glob(path)
	const scans = await Array.fromAsync(glob.scan({ onlyFiles: false }))
	if (scans.length === 0) return false
	const stats = await stat(scans[0]!)
	return stats.isDirectory()
}

/**
 * Parses a JSON string using the specified Zod schema.
 * It also cleans a few common issues with generated JSON strings.
 * @param text The JSON string to parse.
 * @param schema The Zod schema to use for parsing.
 * @param addDefaults Whether to add default values to the parsed object.
 * @throws If the JSON string is invalid or does not match the schema.
 */
export async function parseJson<T extends z.AnyZodObject>(text: string, schema: T, addDefaults = false) {
	text = text.replace(/^```(json)?|```$/g, '').trim()
	text += text.endsWith('}') ? '' : '}'
	text = text.replace(/^['"]|['"]$/g, '').replace('\\_', '_').replace('\\-', '-')
	const merged = addDefaults ? deepDefaults(safeDestr(text), getZodDefaults(schema)) : safeDestr(text)
	return await schema.parseAsync(merged) as z.infer<T>
}

/**
 * Retrieves the default values for a given Zod schema.
 * @param schema The Zod schema for which to retrieve the default values.
 * @param discriminant The discriminant value for discriminated unions.
 */
export function getZodDefaults<T extends z.ZodTypeAny>(schema: T, discriminant?: string): T['_output'] | undefined {
	if (schema instanceof z.ZodDefault) return schema._def.defaultValue()
	else if (schema instanceof z.ZodEnum) return schema.options[0]
	else if (schema instanceof z.ZodNativeEnum) return Object.values(schema.enum)[0]
	else if (schema instanceof z.ZodLiteral) return schema.value
	else if (schema instanceof z.ZodEffects) return getZodDefaults(schema.innerType())
	else if (schema instanceof z.ZodDiscriminatedUnion) {
		if (!discriminant) throw new Error('Discriminant value is required for discriminated unions')
		for (const [key, val] of schema._def.optionsMap.entries())
			if (key === discriminant) return getZodDefaults(val)

		return getZodDefaults(schema._def.options[0])
	}
	else if (schema instanceof z.ZodObject) {
		const shape = schema._def.shape()
		const result: any = {}
		for (const key in shape) {
			const value = getZodDefaults(shape[key])
			if (value !== undefined) result[key] = value
		}
		return result
	}
	else if (schema instanceof z.ZodArray) {
		const result = getZodDefaults(schema.element)
		const isObj = typeof result === 'object' && Object.keys(result).length > 0
		const isOther = typeof result !== 'object' && result !== undefined
		return isOther || isObj ? [result] : []
	}
	else if (schema instanceof z.ZodUnion) {
		for (const val of schema.options) {
			const value = getZodDefaults(val)
			if (value !== undefined) return value
		}
		return undefined
	}
	else return undefined
}
