import '../Env'
import DiscordUser from '@shared/utils/models/DiscordUser.model'
import { mongo_connection } from '../utils/db-connection'

async function main() {
	await mongo_connection()
	const totalUsers = await DiscordUser.countDocuments()
	const limit = 50

	let index = 0
	while (index <= totalUsers) {
		const users = await DiscordUser.find().skip(index).limit(limit)
		for (const user of users) {
			console.log(user)
			user.currencies!.dust += user.wallet.unsyncedDust
			user.wallet.unsyncedDust = 0
			await user.save()
		}
		index += limit
		console.log(`Migrated ${index + limit} users`)
	}
}

main()
