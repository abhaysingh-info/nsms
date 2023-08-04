import { IDiscord } from '@shared/interfaces/discord'
import { Leaderboard } from '@shared/utils/models/Leaderboard.model'
import { sendAdminLog } from '../hooks'
import botConfig from '../../config/bot.config'

export async function leaderboardLogger(
	discorduser: IDiscord,
	log: {
		experience?: number
		numberOfMissionWon?: number
		numberOfRacejackWon?: number
		numberOfPlayerraceWon?: number
		totalNumberOfGamesWon?: number
	} = {
		experience: 0,
		numberOfMissionWon: 0,
		numberOfRacejackWon: 0,
		numberOfPlayerraceWon: 0,
		totalNumberOfGamesWon: 0,
	},
) {
	let leaderboard = await Leaderboard.findOne({
		discordId: discorduser.discordId,
		seasonId: botConfig.seasonId,
	})
	if (!leaderboard) {
		leaderboard = new Leaderboard({
			discordId: discorduser.discordId,
			username: discorduser.username,
			discriminator: discorduser.discriminator,
			experience: 0,
			numberOfMissionWon: 0,
			numberOfRacejackWon: 0,
			numberOfPlayerraceWon: 0,
			totalNumberOfGamesWon: 0,
		})
	}
	leaderboard.seasonDescription = botConfig.seasonDescription
	leaderboard.seasonName = botConfig.seasonName
	leaderboard.seasonId = botConfig.seasonId
	leaderboard.experience += Math.floor((log.experience || 0) / 10)
	leaderboard.numberOfMissionWon += log.numberOfMissionWon || 0
	leaderboard.numberOfRacejackWon += log.numberOfRacejackWon || 0
	leaderboard.numberOfPlayerraceWon += log.numberOfPlayerraceWon || 0
	leaderboard.totalNumberOfGamesWon += log.totalNumberOfGamesWon || 0

	try {
		await leaderboard.save()
	} catch (error: any) {
		sendAdminLog({
			content: `Error while saving leaderboard for ${discorduser.username}#${
				discorduser.discriminator
			} (${discorduser.discordId}) \`\`\`${
				error.message
			}\`\`\`\n\`\`\`${JSON.stringify(log)}\`\`\``,
		})
	}
	return leaderboard
}
