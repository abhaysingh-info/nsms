import { setCache, getCache, deleteCache } from '../redis'
import { Mission, MissionModelName } from '@shared/utils/models/Missions.model'
import { IMissionDB, IMissionOption } from '@shared/interfaces/missions'
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CacheType,
	EmbedBuilder,
} from 'discord.js'
import botConfig from '../../config/bot.config'
import { IChatInputCommandInteraction } from '@shared/interfaces/discord'

export async function getRandomMission(): Promise<IMissionDB> {
	const fn = 'getRandomMission'

	const collectionSizeQuery = { collectionSizeQuery: 1 }
	let collectionSize = await getCache(collectionSizeQuery, fn, MissionModelName)
	if (!collectionSize) {
		collectionSize = await Mission.countDocuments()
		setCache(collectionSizeQuery, collectionSize, fn, MissionModelName)
	}
	const randomIndex = Math.floor(Math.random() * collectionSize)

	let mission = await getCache({ randomIndex }, fn, MissionModelName)
	if (!mission) {
		mission = await Mission.aggregate([{ $sample: { size: 1 } }])
		if (mission.length > 0) {
			mission = mission[0]
			setCache({ randomIndex }, mission, fn, MissionModelName, 60 * 60 * 24 * 1)
		} else {
			throw new Error('No missions found')
		}
	}
	return mission
}

/*
HOW GAME IS PLAYED:
// part of initiate mission
1) create an embed with the mission name and description and list out all the options
2) add the number of buttons as number of options are there

// part of play mission
3) when user select an option then get random number between 0 to 101 where 0 is inclusive and 101 is exclusive
4) if the random number is odd then the user wins and if the random number is even then the user loses
*/

export async function initiateMission() {
	const mission: IMissionDB = await getRandomMission()
	// create an embed with the mission name and description and list out all the options
	const embeds = [
		new EmbedBuilder()
			.setTitle(`${mission.name[0].toUpperCase()}${mission.name.slice(1)}`)
			.setDescription(mission.description)
			.addFields(
				mission.options.map((option: IMissionOption, index: number) => ({
					name: `Option ${index + 1}`,
					value: option.description,
				})),
			),
	]

	const components: ActionRowBuilder[] = []
	const buttons: ButtonBuilder[] = []
	mission.options.forEach((option: IMissionOption, index: number) => {
		buttons.push(
			new ButtonBuilder()
				.setLabel(`Option ${index + 1}`)
				.setStyle(ButtonStyle.Secondary)
				.setCustomId(
					`${botConfig.mission.btnCustomId.optionBtnPrefix}-${index + 1}`,
				),
		)
	})
	const btnActionRow = new ActionRowBuilder().addComponents(buttons)
	components.push(btnActionRow)

	return {
		embeds,
		mission,
		components,
	}
}

export async function playMission(
	mission: IMissionDB,
	optionSelected: number,
	interaction: IChatInputCommandInteraction<CacheType>,
) {
	const randomNum = Math.floor(Math.random() * 101)
	const isWin = randomNum % 2 === 0
	const option = mission.options[optionSelected - 1]
	const embeds = [
		new EmbedBuilder()
			.setTitle(`Mission ${isWin ? 'Successfull' : 'Failed'}`)
			.setDescription(isWin ? option.positiveOutcome : option.negativeOutcome)
			.setColor(
				isWin
					? botConfig.mission.positiveOutcomeColor
					: botConfig.mission.negativeOutcomeColor,
			),
	]
	return {
		embeds,
		isWin,
	}
}
