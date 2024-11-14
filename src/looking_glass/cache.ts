import { log } from '@/logger'
import { RedisCache } from '@langchain/community/caches/ioredis'
import { RedisByteStore } from '@langchain/community/storage/ioredis'
import { type BaseCache, InMemoryCache } from '@langchain/core/caches'
import { type BaseStore, InMemoryStore } from '@langchain/core/stores'
import { parsedEnv } from '@utils'
import { Redis } from 'ioredis'

const { redisUrl, cache: enabled } = parsedEnv

export function llmCache(): BaseCache | undefined {
	if (!enabled) return undefined

	log.info('Using cache for LLM responses...')

	if (redisUrl) return new RedisCache(new Redis(redisUrl))
	return new InMemoryCache()
}

export function embedderCache(): BaseStore<any, any> | undefined {
	if (!enabled) return undefined

	log.info('Using cache for Embedder responses...')

	if (redisUrl) return new RedisByteStore({ client: new Redis(redisUrl) })
	return new InMemoryStore()
}
