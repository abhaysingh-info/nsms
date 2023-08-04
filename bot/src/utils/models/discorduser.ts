import { IDiscordDistributeRewardsParams } from '@shared/interfaces/discord'
import { DiscordUser } from '@shared/utils/models/DiscordUser.model'
import { IStringKey } from '@shared/interfaces'
import botConfig from '../../config/bot.config'
import { multiplyReward } from '../../utils'
import { transactionLogger } from '../../utils/models/transaction'
import { ITransaction } from '@shared/interfaces/transactions'
import { sendAdminLog } from '../hooks'

export async function distributeRewardsToUsers(
	options: IDiscordDistributeRewardsParams,
	cooldownFor:
		| 'raceCooldown'
		| 'questCooldown'
		| 'pvpCooldown' = 'questCooldown',
	note: string = '',
) {
	try {
		const query: IStringKey<any> = {
			$inc: {},
		}
		query[`games.${cooldownFor}`] = new Date(
			new Date().getTime() + 1000 * 60 * 60 * 1,
		)

		const currenciesRewardedList = Object.keys(options.currencies)

		if (currenciesRewardedList.length > 0) {
			for (const currency of currenciesRewardedList) {
				if (options.currencies[currency]) {
					options.currencies[currency] = multiplyReward(
						options.currencies[currency],
						options.dustNftCount,
						options.nftSlab,
					)
					query.$inc[`currencies.${currency}`] = options.currencies[currency]
				}
			}
		}

		if (options.experience) {
			query.$inc['experience'] = options.experience
		}
		if (options.fuel) {
			query.$inc['games.fuel'] = options.fuel
			if (options.fuel > 0) {
				query.$inc['games.cumulativeFuel'] = options.fuel
			}
		}

		const update = await DiscordUser.updateOne(
			{
				discordId: options.discordId,
			},
			query,
		)
		if (!update.acknowledged && !update.modifiedCount) {
			throw new Error("Couldn't update user")
		}
		await transactionLogger({
			discordUserId: options.discordId,
			currentWalletAddress: options.walletAddress,
			transactionType: 'internal',
			currencies: options.currencies,
			fuel: options.fuel,
			experience: options.experience,
			note: note,
		})
		return update.acknowledged && update.modifiedCount
	} catch {
		sendAdminLog({
			content: `Failed to distribute rewards to user ${
				options.discordId
			} with wallet ${options.walletAddress}\n${Object.keys(options.currencies)
				.map((key) => key + ': ' + options.currencies[key])
				.join('\n')}\n${
				options.experience ? 'Experience: ' + options.experience : ''
			}\n${options.fuel ? 'Fuel: ' + options.fuel : ''}`,
		})
		return false
	}
}

export async function getUser(discordId: string) {
	const user = await DiscordUser.findOne({
		discordId,
	})
	return user
}

export async function syncDust(
	discordId: string,
	dust: number,
	fuelToDecrease: number,
	crftNftCount: number = 1,
) {
	const update = await DiscordUser.updateOne(
		{
			discordId: discordId,
		},
		{
			$inc: {
				'wallet.syncedDust': Math.floor(dust),
				'currencies.dust': -Math.floor(dust),
				'games.fuel': -fuelToDecrease,
			},
			'games.launchCooldown': new Date(
				new Date().getTime() + botConfig.launch.cooldown,
			),
		},
	)
	return update.acknowledged && update.modifiedCount
}

export async function sendUserFuel(
	discordId: string,
	fuel: number,
	fromDrip: boolean = false,
) {
	const _update: IStringKey<any> = {
		$inc: {
			'games.fuel': fuel,
			'games.cumulativeFuel': fuel > 0 ? fuel : 0,
		},
	}

	if (fromDrip) {
		_update['$set'] = {
			'games.dripCooldown': new Date(
				new Date().getTime() + botConfig.drip.cooldown,
			),
		}
	}

	const update = await DiscordUser.updateOne(
		{
			discordId,
		},
		_update,
	)
	return update.acknowledged && update.modifiedCount
}

export async function sendUserCurrency(
	discordId: string,
	amount: number,
	currencyName: string = 'dust',
) {
	const _update: IStringKey<any> = {
		$inc: {
			[`currencies.${currencyName}`]: amount,
		},
	}

	const update = await DiscordUser.updateOne(
		{
			discordId,
		},
		_update,
	)
	return update.acknowledged && update.modifiedCount
}

export async function removeWallet(discordId: string) {
	const update = await DiscordUser.updateOne(
		{
			discordId,
		},
		{
			$set: {
				'wallet.address': null,
			},
		},
	)
	return update.acknowledged && update.modifiedCount
}
