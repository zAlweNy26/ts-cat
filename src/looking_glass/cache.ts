import { log } from '@/logger'
import { db } from '@db'
import { RedisCache } from '@langchain/community/caches/ioredis'
import { RedisByteStore } from '@langchain/community/storage/ioredis'
import { type BaseCache, InMemoryCache } from '@langchain/core/caches'
import { type BaseStore, InMemoryStore } from '@langchain/core/stores'
import { Redis } from 'ioredis'

export function llmCache(): BaseCache | undefined {
	const { enabled, redisUrl } = db.data.cache
	if (!enabled) return undefined

	log.info('Using cache for LLM responses...')

	if (process.env.NODE_ENV === 'production' && redisUrl) return new RedisCache(new Redis(redisUrl))
	return new InMemoryCache()
}

export function embedderCache(): BaseStore<any, any> | undefined {
	const { enabled, redisUrl } = db.data.cache
	if (!enabled) return undefined

	log.info('Using cache for Embedder responses...')

	if (process.env.NODE_ENV === 'production' && redisUrl) return new RedisByteStore({ client: new Redis(redisUrl) })
	return new InMemoryStore()
}
