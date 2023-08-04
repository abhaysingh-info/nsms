import {
	IPlayer,
	IPlayersRace,
	IShowRaceDetailEmbed,
} from '@shared/interfaces/playersrace'
import { PlayersRace } from '@shared/utils/models/PlayersRace.model'
import botConfig from '../../config/bot.config'
import { getRandomNumber, getSumOfArray, suffleArray } from '../math'
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	EmbedBuilder,
} from 'discord.js'
import { getRandomRacetrack } from './racetrack'
import { distributeRewardsToUsers, getUser } from './discorduser'
import { IStringKey } from '@shared/interfaces'
import { transactionLogger } from '../../utils/models/transaction'
import { ITransaction } from '@shared/interfaces/transactions'
import { sendPvpLog, sendPvpTurnLog } from '../hooks'
import { progressBar } from '../progressbar'
import DiscordUser from '@shared/utils/models/DiscordUser.model'
import { IDiscord } from '@shared/interfaces/discord'
import { leaderboardLogger } from './leaderboard'
import { pvpMessageRegx, pvpMessages } from '../../config/pvp.config'
import { replaceString } from '..'

const MAX_DICE_CEIL = 10

function getCurrentRound(_playersrace: IPlayersRace, userIndex: number) {
	return _playersrace.players[userIndex].throws.length - 1
}

function getCurrentRoundThrows(_playersrace: IPlayersRace, userIndex: number) {
	return _playersrace.players[userIndex].throws[
		getCurrentRound(_playersrace, userIndex)
	]
}

function getRandomMessage(replaceWith: string) {
	const max = pvpMessages.length
	const randomIndex = getRandomNumber(max)
	return replaceString(pvpMessages[randomIndex], pvpMessageRegx, replaceWith)
}

function getRoundThrows(
	_playersrace: IPlayersRace,
	roundNumber: number,
	userIndex: number,
) {
	return _playersrace.players[userIndex].throws[roundNumber]
}

function throwDice(
	_playersrace: IPlayersRace,
	userIndex: number,
	not_your_business: boolean = false,
) {
	if (!not_your_business) {
		_playersrace.players[userIndex].throws[
			getCurrentRound(_playersrace, userIndex)
		].push(getRandomNumber(MAX_DICE_CEIL))
	} else {
		_playersrace.players[userIndex].throws[
			getCurrentRound(_playersrace, userIndex)
		].push(0)
	}
}

export const getPlatersRaceByCode = async (
	code: string,
	filters: any = {},
): Promise<IPlayersRace | null> => {
	try {
		const playersrace = await PlayersRace.findOne({ code, ...filters })
		return playersrace as IPlayersRace | null
	} catch {
		return null
	}
}

export const getPlayersRace = async (
	filters: any = {},
): Promise<IPlayersRace | null> => {
	try {
		const playersrace = await PlayersRace.findOne({ ...filters })
		return playersrace as IPlayersRace | null
	} catch {
		return null
	}
}

export const createPlayersRace = async (
	discordId: string,
	stakeRequired: { currency: string; amount: number },
	maxPlayersAllowed: number = 2,
) => {
	try {
		if (!botConfig.whitelistAssetValues.includes(stakeRequired.currency)) {
			return {
				success: false,
				message: 'Invalid currency',
			}
		}
		try {
			const playersrace = await getPlayersRace({
				$or: [
					{
						players: {
							$elemMatch: {
								discordId,
							},
						},
					},
					{
						discordId,
					},
				],
				hasRaceEnded: false,
				raceCancelled: false,
			})
			if (playersrace) {
				return {
					success: false,
					message: "You're already in a PvP",
				}
			}
		} catch (error) {
			return {
				success: false,
				message: "Failed to verify if you're already in a PvP",
			}
		}

		const user = await getUser(discordId)
		if (!user) return { success: false, message: 'User not found' }

		if (
			(user.currencies as IStringKey<number>)[stakeRequired.currency] <
			stakeRequired.amount
		) {
			return {
				success: false,
				message: `You don't have enough ${stakeRequired.currency.toUpperCase()}`,
			}
		}

		;(user.currencies as IStringKey<number>)[stakeRequired.currency] -=
			stakeRequired.amount

		const playerraceCount = await PlayersRace.countDocuments({})
		if (playerraceCount !== 0 && !playerraceCount) {
			return {
				success: false,
				message: "Couldn't generate a new playersrace code",
			}
		}

		const randomAlphaNumeral = getRandomNumber(1000)
		const code = `${botConfig.playersrace.codePrefix}${randomAlphaNumeral}${
			playerraceCount + 1
		}`

		try {
			const transaction: ITransaction = {
				currencies: {
					[stakeRequired.currency]: stakeRequired.amount,
				},
				transactionType: 'internal',
				currentWalletAddress: user.wallet.address || '',
				discordUserId: user.discordId,
				fuel: 0,
				note: `Stake for playersrace ${code}`,
			}

			await user.save()

			try {
				await transactionLogger(transaction)
			} catch (error) {
				sendPvpLog(
					{
						embeds: [
							new EmbedBuilder()
								.setTitle('Transaction Logger Error')
								.setDescription(
									`Failed to log the transaction for race ${code}`,
								)
								.setColor(Colors.Red),
						],
					},
					user.discordId,
				)

				return {
					success: false,
					message:
						"Couldn't save the transaction, in case if your money is debited then please contact mods we will help you out!",
				}
			}
		} catch (error) {
			return {
				success: false,
				message: "Couldn't save the user",
			}
		}

		try {
			const playersrace = await PlayersRace.create({
				discordId,
				code,
				raceTrack: await getRandomRacetrack(),
				maxPlayersAllowed,
				stakeRequired,
				players: [
					{
						discordId,
						stake: stakeRequired,
					},
				],
			})

			return {
				success: true,
				playersrace,
				message: 'New race started!',
			}
		} catch (error: any) {
			console.log(error.message)
			// console.log(error)
			return {
				success: false,
				message: "Couldn't create a new playersrace",
			}
		}
	} catch (error) {
		console.log(error)
		return {
			success: false,
			message: "Couldn't create a new playersrace",
		}
	}
}

export const showRaceDetailEmbed = ({
	interaction,
	race,
	description,
	title,
	color,
}: IShowRaceDetailEmbed) =>
	new EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setColor(color)
		.addFields(
			{
				name: 'Code',
				value: `${race?.code}`,
				inline: true,
			},
			{
				name: 'Stake Amount',
				value: `${race?.stakeRequired.amount} ${
					(botConfig.emoji as IStringKey<string>)[
						race?.stakeRequired?.currency || ''
					]
				}`,
				inline: true,
			},
			{
				name: 'No of Participants',
				value: `${(race?.players || []).length} of ${race?.maxPlayersAllowed}`,
				inline: true,
			},
			{
				name: 'Players Required to Start',
				value: `${
					(race?.maxPlayersAllowed || 0) - (race?.players || []).length
				} of ${race?.maxPlayersAllowed}`,
			},
			{
				name: 'Race track name',
				value: `${race?.raceTrack.name}`,
				inline: true,
			},
			{
				name: 'Race track length',
				value: `${race?.raceTrack.raceTrackLength}`,
				inline: true,
			},
			{
				name: 'Race track description',
				value: `${race?.raceTrack.description}`,
			},
		)
		.setAuthor({
			name: interaction.user.username,
			iconURL: interaction.user.avatarURL() || undefined,
		})

export class PlayerRaceGame {
	constructor(
		public playerRace: IPlayersRace,
		public currentPlayerId: string,
	) {}

	hasAllPlayerStabalizedOrBustedOrWonInCurrentRound() {
		const allPlayersCurrentRoundThrows = this.playerRace.players
			.map((player) => {
				const currentRoundThrows = player.throws[player.throws.length - 1] || []
				return (
					currentRoundThrows.includes(0) ||
					getSumOfArray(currentRoundThrows) >= 21
				)
			})
			.reduce((prevValue, currentValue) => prevValue && currentValue, true)
		return allPlayersCurrentRoundThrows
	}

	hasAllPlayerStabalizedInCurrentRound() {
		const allPlayersCurrentRoundThrows = this.playerRace.players
			.map((player) => {
				const currentRoundThrows = player.throws[player.throws.length - 1] || []
				return currentRoundThrows.includes(0)
			})
			.reduce((prevValue, currentValue) => prevValue && currentValue, true)
		return allPlayersCurrentRoundThrows
	}

	isPlayerBustedOrWonInCurrentRound() {
		const currentRoundThrows = getCurrentRoundThrows(
			this.playerRace,
			this.playerRace.currentPlayerIndex,
		)
		const currentRoundSum = getSumOfArray(currentRoundThrows)

		return currentRoundSum >= 21
	}

	private checkIfAnyPlayerHasWon() {
		const allPlayersTotal = this.playerRace.players.map(
			(player) => player.total,
		) // [0, 215, 65, 46, 215]

		const maxTotal = Math.max(...allPlayersTotal) // 215
		const maxCount = allPlayersTotal.reduce(
			(prevValue, currentValue) =>
				currentValue === maxTotal ? prevValue + 1 : prevValue,
			0,
		) // 2

		if (maxTotal >= this.playerRace.raceTrack.raceTrackLength) {
			this.playerRace.hasRaceEnded = true
			const winnersIndex = allPlayersTotal
				.map((total, index) => (total === maxTotal ? index : -1))
				.filter((index) => index !== -1)
			this.playerRace.winnersIndex = winnersIndex
			return this.playerRace.players.filter((_, index) =>
				winnersIndex.includes(index),
			)
		}

		return null
	}

	checkAndGetWinner() {
		return this.checkIfAnyPlayerHasWon()
	}

	private calculateTotalOfAllPlayers() {
		this.playerRace.players.forEach((player, index) => {
			if (player.total >= this.playerRace.raceTrack.raceTrackLength) return
			player.total = 0
			player.throws.forEach((round, roundIndex) => {
				const total = getSumOfArray(round)
				if (total <= 21) {
					player.total += total
				} else {
					player.total += 0
				}
			})
		})
	}

	calculateTotalAndCheckWinner() {
		if (this.playerRace.hasRaceEnded) {
			return
		}
		this.calculateTotalOfAllPlayers()
		return this.checkIfAnyPlayerHasWon()
	}

	private setNextPlayerTurn() {
		if (
			this.playerRace.currentPlayerIndex >=
			this.playerRace.maxPlayersAllowed - 1
		) {
			this.playerRace.currentPlayerIndex = 0
		} else {
			this.playerRace.currentPlayerIndex += 1
		}

		this.playerRace.currentPlayerTurnStartAt = new Date()
	}

	private isRaceValidToPlayAhead() {
		if (!this.playerRace.hasRaceStarted)
			throw new Error('Race has not been started yet!')
		if (this.playerRace.raceCancelled)
			throw new Error('Race has been cancelled!')
		if (this.playerRace.players.length < 2)
			throw new Error('Not enough players to play the game!')
		if (this.playerRace.hasRaceEnded) {
			throw new Error('Race has been ended!')
		}
		return true
	}

	private playPlayersChance(playOrStabalize: 'play' | 'stabalize') {
		const isRaceValidToPlayAhead = this.isRaceValidToPlayAhead()
		if (!isRaceValidToPlayAhead) {
			throw isRaceValidToPlayAhead
		}
		throwDice(
			this.playerRace,
			this.playerRace.currentPlayerIndex,
			playOrStabalize === 'stabalize',
		)
	}

	playPlayersTurnAndPlayNextTurn(
		playersDiscordId: string,
		playOrStabalize: 'play' | 'stabalize',
	): {
		success: boolean
		message: string
		showBtn?: boolean
		showGameBoard?: boolean
	} {
		this.calculateTotalAndCheckWinner()

		if (this.playerRace.hasRaceEnded) {
			return {
				success: true,
				message: 'Race has already been ended!',
				showBtn: false,
			}
		}
		const playerIndex = this.playerRace.players.findIndex(
			(player) => player.discordId === playersDiscordId,
		)

		if (playerIndex === -1) {
			return {
				success: false,
				message: 'Player not found!',
				showBtn: false,
			}
		}
		if (
			playersDiscordId !==
			this.playerRace.players[this.playerRace.currentPlayerIndex].discordId
		) {
			return {
				success: false,
				message: `<@${playersDiscordId}> it's not your turn, Please ask <@${
					this.playerRace.players[this.playerRace.currentPlayerIndex].discordId
				}> to play their turn!`,
				showBtn: false,
			}
		}

		if (
			playOrStabalize === 'stabalize' &&
			getCurrentRoundThrows(this.playerRace, playerIndex).includes(0)
		) {
			return {
				success: false,
				message: `<@${playersDiscordId}>, you have already stabalized your engine!`,
				showBtn: true,
				showGameBoard: true,
			}
		}

		try {
			this.playPlayersChance(playOrStabalize)

			// check if player got busted in current round or not? if he got busted then simply make his points 0
			// const currentRoundThrows = getCurrentRoundThrows(
			// 	this.playerRace,
			// 	playerIndex,
			// )
			const isPlayerBustedOrWonInCurrentRound =
				this.isPlayerBustedOrWonInCurrentRound()

			// isPlayerBustedOrWonInCurrentRound ||
			if (this.hasAllPlayerStabalizedOrBustedOrWonInCurrentRound()) {
				this.startNewRound()
			}

			if (
				!this.playerRace.hasRaceEnded &&
				(isPlayerBustedOrWonInCurrentRound || playOrStabalize === 'stabalize')
			) {
				this.setNextPlayerTurn()
			}
			this.calculateTotalAndCheckWinner()
			return {
				success: true,
				message: 'Played your chance',
			}
		} catch (error: any) {
			return { success: false, message: error.message, showBtn: false }
		}
	}

	startNewRound() {
		this.playerRace.players.forEach((player, index: number) => {
			player.throws.push([])
			throwDice(this.playerRace, index)
			throwDice(this.playerRace, index)
		})
	}

	init() {
		if (this.playerRace.players.length >= this.playerRace.maxPlayersAllowed) {
			if (!this.playerRace.hasRaceStarted) {
				this.playerRace.hasRaceStarted = true
				this.playerRace.players = suffleArray(this.playerRace.players)
				this.playerRace.currentPlayerIndex = 0
				this.playerRace.currentPlayerTurnStartAt = new Date()
				this.startNewRound()
			}
		}
	}

	getWinnersReward() {
		const numberOfWinners = this.playerRace.winnersIndex.length
		return (
			(this.playerRace.stakeRequired.amount *
				this.playerRace.players.length *
				botConfig.playersrace.raceRewardPercentage) /
			numberOfWinners
		)
	}

	private calculateExperience() {
		return this.playerRace.raceTrack.raceTrackLength
	}

	async distributeRewardAndDeductStake() {
		const winners = this.checkAndGetWinner()
		if (!winners) return
		const users: IDiscord[] = await DiscordUser.find({
			discordId: {
				$in: this.playerRace.players.map((player) => player.discordId),
			},
		})
		const leaderboardLog: Promise<any>[] = []
		const distributeRewardPromise = await Promise.allSettled(
			users.map(async (user: IDiscord) => {
				const winnersDiscordId = winners.map((winner) => winner.discordId)

				if (winnersDiscordId.includes(user.discordId)) {
					leaderboardLog.push(
						leaderboardLogger(user, {
							experience: this.calculateExperience(),
							numberOfPlayerraceWon: 1,
							totalNumberOfGamesWon: 1,
						}),
					)
					return await distributeRewardsToUsers(
						{
							discordId: user.discordId,
							currencies: {
								[this.playerRace.stakeRequired.currency]:
									this.getWinnersReward(),
							},
							dustNftCount: 1,
							nftSlab: botConfig.slabs.crft,
							fuel: 0,
							experience: this.calculateExperience(),
							walletAddress: user.wallet.address || '',
						},
						'pvpCooldown',
						`Won in ${this.playerRace.raceTrack.name} (${this.playerRace.code})`,
					)
				} else {
					leaderboardLog.push(
						leaderboardLogger(user, {
							experience: this.calculateExperience(),
							numberOfPlayerraceWon: 0,
							totalNumberOfGamesWon: 0,
						}),
					)
					return await distributeRewardsToUsers(
						{
							discordId: user.discordId,
							currencies: {
								[this.playerRace.stakeRequired.currency]: 0,
							},
							dustNftCount: 0,
							nftSlab: botConfig.slabs.crft,
							fuel: 0,
							experience: this.calculateExperience(),
							walletAddress: user.wallet.address || '',
						},
						'pvpCooldown',
						`Won in ${this.playerRace.raceTrack.name} (${this.playerRace.code})`,
					)
				}
			}),
		)
		await Promise.allSettled(leaderboardLog)
		return distributeRewardPromise
	}
}

export class BotSpecificPlayerRaceGame extends PlayerRaceGame {
	constructor(public playerRace: IPlayersRace, public currentPlayerId: string) {
		super(playerRace, currentPlayerId)
	}

	sendPvPLog() {
		const taggedUsers = this.playerRace.players.map(
			(players) => players.discordId,
		)
		try {
			sendPvpLog(
				{
					embeds: [this.createGameBoard()],
					content: 'Race has been started between ',
				},
				taggedUsers,
			)
		} catch (error) {
			console.log('Failed to send log')
		}
	}

	sendLogForNextTurn() {
		try {
			if (!(this.playerRace.winnersIndex || []).length) {
				sendPvpTurnLog({
					content: `:race_car:  <@${
						this.playerRace.players[this.playerRace.currentPlayerIndex]
							.discordId
					}> play your turn in ${this.playerRace.raceTrack.name}`,
				})
			}
		} catch {
			console.log('Failed to send log for next turn')
		}
	}

	createGameBoard() {
		this.calculateTotalAndCheckWinner()
		let embed = new EmbedBuilder()
			.setTitle(`${this.playerRace.raceTrack.name} - ${this.playerRace.code} `)
			.setDescription(this.playerRace.raceTrack.description)

		embed.addFields({
			name: 'Round Number',
			value: `${this.playerRace.players[0].throws.length}`,
			inline: true,
		})
		embed.addFields({
			name: 'Current Turn',
			value: `<@${
				this.playerRace.players[this.playerRace.currentPlayerIndex].discordId
			}>`,
			inline: true,
		})
		embed.addFields({
			name: ' ',
			value: ` `,
		})
		embed.addFields({
			name: ' ',
			value: `---------------------------------------------`,
		})

		this.playerRace.players.forEach((player, index) => {
			const currentRoundThrows = getCurrentRoundThrows(
				this.playerRace,
				index,
			).join('` `')

			embed.addFields({
				name: `   `,
				value: `Total Score: ${player.total}/${
					this.playerRace.raceTrack.raceTrackLength
				}\n${progressBar(
					player.total,
					this.playerRace.raceTrack.raceTrackLength,
					15,
				)}\nEngine Thrust: \`${currentRoundThrows}\`\n<@${
					player.discordId
				}> Total Output: ${getSumOfArray(
					getCurrentRoundThrows(this.playerRace, index),
				)}`,
				inline: true,
			})
			if (index % 2 === 1) {
				embed.addFields({ name: '   ', value: '   ' })
			}
		})
		return embed
	}

	createReplayEmbed(roundNumber = 0) {
		let embed = new EmbedBuilder().setTitle(
			`${this.playerRace.raceTrack.name} - ${this.playerRace.code} `,
		)
		// .setDescription(this.playerRace.raceTrack.description)

		embed.addFields({
			name: 'Round Number',
			value: `${roundNumber + 1}`,
			inline: true,
		})
		embed.addFields({
			name: 'Current Turn',
			value: `<@${
				this.playerRace.players[this.playerRace.currentPlayerIndex].discordId
			}>`,
			inline: true,
		})
		embed.addFields({
			name: ' ',
			value: ` `,
		})
		embed.addFields({
			name: ' ',
			value: `---------------------------------------------`,
		})

		this.playerRace.players.forEach((player, index) => {
			const currentRoundThrows = getRoundThrows(
				this.playerRace,
				roundNumber,
				index,
			).join('` `')

			const total = this.playerRace.players[index].throws
				.slice(0, roundNumber + 1)
				.reduce((prevValue, currentValue) => {
					const t = getSumOfArray(currentValue)
					return t <= 21 ? prevValue + getSumOfArray(currentValue) : prevValue
				}, 0)

			embed.addFields({
				name: `   `,
				value: `Total Score: ${total}/${
					this.playerRace.raceTrack.raceTrackLength
				}\n${progressBar(
					total,
					this.playerRace.raceTrack.raceTrackLength,
					15,
				)}\nEngine Thrust: \`${currentRoundThrows}\`\n<@${
					player.discordId
				}> Total Output: ${getSumOfArray(
					getRoundThrows(this.playerRace, roundNumber, index),
				)}`,
				inline: true,
			})
			if (index % 2 === 1) {
				embed.addFields({ name: '   ', value: '   ' })
			}
		})
		return embed
	}

	createWinnersEmbed() {
		const winners = this.checkAndGetWinner()
		if (!winners) return null
		const embed = new EmbedBuilder()
		embed.setTitle(
			`Winner of ${this.playerRace.raceTrack.name} - ${this.playerRace.code} `,
		)

		this.playerRace.players.forEach((player, index) => {
			embed.addFields({
				name: ' ',
				value: `<@${player.discordId}>\nTotal: ${player.total}`,
				inline: true,
			})
		})
		embed.addFields({
			name: 'Winning Reward',
			value: `
			${this.getWinnersReward()} ${
				(botConfig.emoji as IStringKey<string>)[
					this.playerRace.stakeRequired.currency
				]
			}`,
		})
		embed.addFields({
			name: ' ',
			value: ` `,
		})

		// embed.addFields({
		// 	name: `By travelling \`${winners[0].total}\` light years`,
		// 	value: `${winners.map(
		// 		(winner) => '<@' + winner.discordId + '>',
		// 	)} won the race and won ${
		// 		this.playerRace.stakeRequired.amount *
		// 		this.playerRace.players.length *
		// 		botConfig.playersrace.raceRewardPercentage
		// 	} ${
		// 		(botConfig.emoji as IStringKey<string>)[
		// 			this.playerRace.stakeRequired.currency
		// 		]
		// 	}`,
		// })
		winners.forEach((winner) => {
			embed.addFields({
				name: ` `,
				value: `${getRandomMessage('<@' + winner.discordId + '>')}`,
			})
		})
		return embed
	}
}
