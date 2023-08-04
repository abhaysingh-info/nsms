import '../Env'
import DiscordUser from '@shared/utils/models/DiscordUser.model'
import { mongo_connection } from '../utils/db-connection'
import { leaderboardLogger } from 'src/utils/models/leaderboard'
import Leaderboard from '@shared/utils/models/Leaderboard.model'
import botConfig from '../config/bot.config'

async function main() {
	await mongo_connection()
	const totalUsers = await DiscordUser.countDocuments()
	const limit = 50

	let index = 0
	while (index <= totalUsers) {
		const users = await DiscordUser.find().skip(index).limit(limit)
		for (const user of users) {
			console.log(user)
			let leaderboard = await Leaderboard.findOne({
				discordId: user.discordId,
				seasonId: botConfig.seasonId,
			})
			if (!leaderboard) {
				await leaderboardLogger(user, {
					experience: user.experience,
				})
			} else {
				await leaderboardLogger(user, {
					experience: user.experience - leaderboard.experience,
				})
			}

			await user.save()
			console.log(
				`[SAVED] ${user.username}#${user.discriminator} (${user.discordId}): ${user.experience}xp`,
			)
		}
		index += limit
		console.log(`Migrated ${index + limit} users`)
	}
}

main()
