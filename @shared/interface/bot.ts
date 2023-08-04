import { CacheType } from 'discord.js'
import { IChatInputCommandInteraction } from './discord'

export type BotMiddlewareFunction = (
	interaction: IChatInputCommandInteraction<CacheType>,
) =>
	| Promise<{ goAhead: boolean; message: string }>
	| { goAhead: boolean; message: string }
