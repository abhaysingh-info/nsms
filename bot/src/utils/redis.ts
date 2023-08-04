import { createClient } from 'redis'

const client = createClient({
	url: process.env.REDIS_URL,
})

client.on('error', (err) => console.log('Redis Client Error', err))
export const connectRedis = async () => {
	console.log('[caching] Connecting to Redis')
	await client.connect()
	console.log('[caching] Connected to Redis')
}

export async function setCache(
	key: any,
	value: any,
	fn: string,
	model: string,
	expiry: number = 60 * 10,
) {
	try {
		await client.set(createKey(key, fn, model), JSON.stringify(value), {
			EX: expiry,
		})
	} catch (error: any) {
		return null
	}
}

export async function getCache(key: any, fn: string, model: string) {
	try {
		return JSON.parse(`${await client.get(createKey(key, fn, model))}`)
	} catch (error: any) {
		return null
	}
}

export async function deleteCache(key: any, fn: string, model: string) {
	try {
		client.del(createKey(key, fn, model))
	} catch (error) {
		return null
	}
}

function createKey(...args: any[]) {
	return JSON.stringify(args)
}
