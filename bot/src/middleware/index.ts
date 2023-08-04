import { CacheType, ChatInputCommandInteraction, Message } from 'discord.js'
import { BotMiddlewareFunction } from '@shared/interfaces/bot'

export const executeWithMiddleware = async (
	interaction: ChatInputCommandInteraction<CacheType>,
	...middlewares: (BotMiddlewareFunction | Function)[]
) => {
	try {
		const middleware_count = middlewares.length

		for (let index = 0; index < middleware_count; index++) {
			if (index + 1 === middleware_count) {
				middlewares[index](interaction)
				break
			} else {
				const output: { goAhead: boolean; message: string } = await middlewares[
					index
				](interaction)

				if (!output?.goAhead) {
					await interaction.reply({
						content: `${output.message}`,
						ephemeral: true,
					})
					break
				}
			}
		}
	} catch (err: any) {
		console.error(err.error?.message || err.message || err)
		await interaction.reply({
			content: `Something went wrong!`,
			ephemeral: true,
		})
	}
}
