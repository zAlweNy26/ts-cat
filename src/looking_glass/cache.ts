import type { BaseCache } from '@langchain/core/caches'
import type { BaseStore } from '@langchain/core/stores'
import { RedisCache } from '@langchain/community/caches/ioredis'
import { RedisByteStore } from '@langchain/community/storage/ioredis'
import { InMemoryCache } from '@langchain/core/caches'
import { InMemoryStore } from '@langchain/core/stores'
import { parsedEnv } from '@utils'
import { Redis } from 'ioredis'
import { log } from '@/logger'

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
