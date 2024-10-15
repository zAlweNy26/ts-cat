import { log } from '@/logger'
import { db } from '@db'
import { RedisCache } from '@langchain/community/caches/ioredis'
import { type BaseCache, InMemoryCache } from '@langchain/core/caches'
import { Redis } from 'ioredis'

export function llmCache(): BaseCache | undefined {
	const cacheConfig = db.data?.cache
	if (!cacheConfig) {
		log.error('Cache configuration is missing in the database')
		return undefined
	}

	const { enabled, redisUrl } = cacheConfig
	if (!enabled) return undefined

	log.info('Using cache for LLM responses...')

	if (process.env.NODE_ENV === 'production' && redisUrl) return new RedisCache(new Redis(redisUrl))
	return new InMemoryCache()
}
