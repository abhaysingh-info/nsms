import './Env'
import { connectRedis } from './utils/redis'
import { mongo_connection } from './utils/db-connection'
import Bot from './app'
import { connectAlgo } from './utils/algorand'

connectRedis()
connectAlgo()
mongo_connection()
Bot.login(process.env.BOT_TOKEN)
