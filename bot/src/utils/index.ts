import { IStringKey } from '@shared/interfaces'
import { IReducerSlab } from '@shared/interfaces/bot'
import { IChatInputCommandInteraction } from '@shared/interfaces/discord'
import { ChatInputCommandInteraction, Colors, EmbedBuilder } from 'discord.js'

export function getDayHourMinuteSecond(milliseconds: number): {
	days: number
	hours: number
	minutes: number
	seconds: number
	cooldownString: string
	cooldownEnded: boolean
} {
	if (milliseconds < 0) milliseconds = 0
	const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
	const hours = Math.floor(
		(milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
	)
	const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

	const output = {
		days,
		hours,
		minutes,
		seconds,
		cooldownString: `${days ? days + ' days' : ''} ${
			hours ? hours + ' hours' : ''
		} ${minutes ? minutes + ' minutes' : ''} ${
			hours && minutes && seconds ? 'and' : ''
		} ${seconds ? seconds + ' seconds' : ''}`,
		cooldownEnded: !days && !hours && !minutes && !seconds,
	}
	if (!days && !hours && !minutes && !seconds)
		output.cooldownString = 'Cooldown Ended'
	return output
}

export function reduceCooldownBySlab(
	cooldown: number,
	nftCount: number,
	slabs: IReducerSlab[],
	type: 'incremental' | 'flat' = 'incremental',
) {
	let reducedCooldown = cooldown
	if (type === 'incremental') {
		for (const slab of slabs) {
			if (nftCount >= slab.min) {
				reducedCooldown =
					reducedCooldown -
					(reducedCooldown * (slab?.reduceByPercent || 0)) / 100
			}
		}
	} else if (type === 'flat') {
		for (const slab of slabs) {
			if (nftCount >= slab.min) {
				reducedCooldown =
					cooldown - (cooldown * (slab?.reduceByPercent || 0)) / 100
			}
		}
	} else {
		throw new Error('Invalid type')
	}
	return reducedCooldown
}

export function multiplyReward(
	reward: number,
	nftCount: number,
	slabs: IReducerSlab[],
) {
	let multipliedReward = parseInt(reward.toString())
	for (const slab of slabs) {
		if (nftCount >= slab.min) {
			multipliedReward = reward * (slab?.rewardMultiple || 1)
		}
	}
	return multipliedReward
}

export function extendEmbedDescription(
	embed: EmbedBuilder,
	description: string,
) {
	const jsonEmbed = embed.toJSON()
	const currentDescription = jsonEmbed.description || ''
	return embed.setDescription(`${currentDescription}\n${description}`)
}

export async function replyInteraction(
	interaction:
		| ChatInputCommandInteraction<any>
		| IChatInputCommandInteraction<any>,
	message: any,
) {
	if (interaction.isRepliable()) {
		if (interaction.replied || interaction.deferred) {
			return await interaction.editReply(message)
		} else {
			return await interaction.reply(message)
		}
	}
}

const colors = Object.keys(Colors)
const colorsLength = colors.length
export function getRandomColor() {
	return (Colors as IStringKey<number>)[
		colors.at(Math.floor(Math.random() * colorsLength)) || 0
	]
}

export function replaceString(
	original: string,
	regx: RegExp | string,
	replaceWith: string,
) {
	return original.replace(regx, replaceWith)
}
