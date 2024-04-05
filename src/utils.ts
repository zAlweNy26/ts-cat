import 'dotenv/config'
import { join } from 'node:path'
import { readFileSync, readdirSync } from 'node:fs'
import { type CriteriaLike, loadEvaluator } from 'langchain/evaluation'
import { z } from 'zod'

export const LogLevel = ['debug', 'info', 'normal', 'warning', 'error'] as const

const envSchema = z.object({
	CORE_HOST: z.string().default('localhost'),
	CORE_PORT: z.coerce.number().default(1865),
	CORE_USE_SECURE_PROTOCOLS: z.coerce.boolean().default(false),
	QDRANT_HOST: z.string().default('localhost'),
	QDRANT_PORT: z.coerce.number().default(6333),
	QDRANT_API_KEY: z.string().optional(),
	API_KEY: z.string().optional(),
	CORS_ALLOWED_ORIGINS: z.string().transform(v => v.split(',')).default('*'),
	LOG_LEVEL: z.string().transform(v => v.toLowerCase() as typeof LogLevel[number]).refine(v => LogLevel.includes(v)).default('normal'),
	SAVE_MEMORY_SNAPSHOTS: z.coerce.boolean().default(false),
	WATCH: z.coerce.boolean().default(false),
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
	verbose: LogLevel.indexOf(s.LOG_LEVEL) < LogLevel.indexOf(LogLevel[2]),
}))

export const parsedEnv = envSchema.parse(process.env)

function getBaseUrl() {
	const protocol = parsedEnv.secure ? 'https' : 'http'
	const address = `${protocol}://${parsedEnv.host}${parsedEnv.port ? `:${parsedEnv.port}` : ''}`
	return new URL(address)
}

export const catPaths = {
	basePath: 'src',
	baseUrl: getBaseUrl().href,
	pluginsPath: join('src', 'plugins'),
	assetsPath: join('src', 'assets'),
	assetsUrl: `${getBaseUrl().href}assets`,
}

export function logWelcome() {
	const cat = readFileSync('src/welcome.txt', 'utf8')
	console.log(cat)
	console.log('===================== ^._.^ =====================')
	console.log(`Cat REST API:	${getBaseUrl().href}docs`)
	console.log(`Cat ADMIN:		${getBaseUrl().href}admin`)
	console.log(`Cat WEBSOCKET:	${getBaseUrl().href.replace('http', 'ws')}ws`)
	console.log('=================================================')
}

/**
 * Retrieves all files recursively from the specified path.
 * @param path The path to search for files.
 * @returns An array of Dirent objects representing the files found.
 */
export function getFilesRecursively(path: string) {
	const dirents = readdirSync(path, { withFileTypes: true, recursive: true, encoding: 'utf-8' })
	for (const dirent of dirents) dirent.path = join(dirent.path, dirent.name)
	return dirents
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
 * Pauses the execution for a specified number of milliseconds.
 * @param ms The number of milliseconds to sleep.
 */
export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])

type Literal = z.infer<typeof literalSchema>
type Json = Literal | { [key: string]: Json } | Json[]

export type ZodGenericObject<T extends z.ZodRawShape = any> = z.ZodObject<T>

export interface Message {
	text: string
	[key: string]: any
}

export const zodJsonType: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(zodJsonType), z.record(zodJsonType)]),
)
