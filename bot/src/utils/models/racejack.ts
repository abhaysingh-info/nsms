import { IBlackjack } from '@shared/interfaces/blackjack'
import { Blackjack } from '@shared/utils/models/BlackJack.model'
import { EmbedBuilder, ColorResolvable, Colors } from 'discord.js'
import { getRandomNumber, getSumOfArray } from '../math'
import botConfig from '../../config/bot.config'
import { extendEmbedDescription } from '..'
import { progressBar } from '../progressbar'
import { getRandomRacetrack } from './racetrack'

export const getBlackjack = async (
	discordId: string,
	filters: any = {},
): Promise<IBlackjack | null> => {
	try {
		const blackjack = await Blackjack.findOne({ discordId, ...filters })
		return blackjack as IBlackjack | null
	} catch {
		return null
	}
}

export const createBlackjack = async (discordId: string) => {
	const raceTrack = await getRandomRacetrack()
	const blackjack = new Blackjack({
		discordId,
		raceTrack: raceTrack,
	})
	return blackjack
}

export function showNextRoundButton(blackjack: IBlackjack) {
	const botLastRoundSum = getSumOfArray(
		blackjack.throws.bot[blackjack.throws.bot.length - 1],
	)
	const userLastRoundSum = getSumOfArray(
		blackjack.throws.user[blackjack.throws.user.length - 1],
	)
	return botLastRoundSum >= 21 || userLastRoundSum >= 21
}

export function getRacetrackLength(blackjack: IBlackjack) {
	return blackjack.raceTrack?.raceTrackLength || 50
}

export function startNewRound(blackjack: IBlackjack) {
	if (
		blackjack.total.bot >= getRacetrackLength(blackjack) ||
		blackjack.total.user >= getRacetrackLength(blackjack)
	) {
		return
	}

	blackjack.throws.bot.push([rollDice(), rollDice()])
	blackjack.throws.user.push([rollDice(), rollDice()])
}

export class RaceJackEmbed {
	private _embed = new EmbedBuilder()
	constructor(
		private blackjack: IBlackjack,
		private showFields: boolean = true,
	) {
		this._embed = this._embed.setTitle('SPCE-RACE')
		if (this.showFields) {
			this._embed = this._embed.addFields([
				{
					name: 'Your Power Level',
					value: this.constructValueForCardsInHand({
						throws: blackjack.throws['user'],
						who: 'user',
					}),
					inline: true,
				},
				{
					name: 'SPCE-BOT',
					value: this.constructValueForCardsInHand({
						throws: blackjack.throws['bot'],
						who: 'bot',
					}),
					inline: true,
				},
			])
		}

		this.extendDescription(
			`${this.blackjack.raceTrack.name} - ${this.blackjack.raceTrack.description}\n`,
		)
		this.extendDescription(
			`Score: ${blackjack.total.user}/${getRacetrackLength(blackjack)} VS ${
				blackjack.total.bot
			}/${getRacetrackLength(blackjack)}`,
		)
		// this._embed = this.extendDescription(this._embed, ``)
		this.extendDescription(
			`You: ${progressBar(
				blackjack.total.user,
				getRacetrackLength(blackjack),
				25,
			)}\nBot: ${progressBar(
				blackjack.total.bot,
				getRacetrackLength(blackjack),
				25,
			)}`,
		)
	}

	get embed() {
		return this._embed
	}

	setDescription(description: string | null) {
		this._embed = this._embed.setDescription(description)
	}

	extendDescription(description: string) {
		this._embed = extendEmbedDescription(this._embed, description)
	}

	constructValueForCardsInHand({
		throws,
		who,
	}: {
		throws: number[][]
		who: 'user' | 'bot'
	}) {
		const currentRoundThrows = throws[throws.length - 1]
		const throwSum = getSumOfArray(currentRoundThrows)
		if (who === 'user') {
			return (
				'Engine Thrusts: ` ' +
				currentRoundThrows.join(' ` ` ') +
				' ` ' +
				(throwSum < 21 ? '` ? `' : '') +
				`\nPower Output: ${throwSum}`
			)
		}
		const userThrows =
			this.blackjack.throws.user[this.blackjack.throws.user.length - 1]
		const userThrowSum = getSumOfArray(
			this.blackjack.throws.user[this.blackjack.throws.user.length - 1],
		)
		let output =
			'Engine Thrusts: ` ' +
			currentRoundThrows.join(' ` ` ') +
			' ` ' +
			`\nPower Output: \` ${throwSum} \``

		if (userThrowSum < 21 && !userThrows.includes(0)) {
			if (
				(currentRoundThrows.length === 2 && throwSum < 21) ||
				!userThrows.includes(0)
			) {
				output =
					'Engine Thrusts: ` ' +
					currentRoundThrows[0] +
					' ` ' +
					'` ? `' +
					`\nPower Output: \` ? \``
			}
		}

		return output
	}

	setColor(color: ColorResolvable) {
		this._embed = this._embed.setColor(color)
	}
}

export function getWinningEmbed(
	blackjack: IBlackjack,
	cb: Function,
): EmbedBuilder | null {
	if (
		blackjack.total.bot >= getRacetrackLength(blackjack) ||
		blackjack.total.user >= getRacetrackLength(blackjack)
	) {
		let embed = new RaceJackEmbed(blackjack, false)
		embed.setDescription(null)
		if (blackjack.total.user === blackjack.total.bot) {
			embed.extendDescription("It's a tie")
			embed.setColor(Colors.Grey)
		} else if (blackjack.total.user > blackjack.total.bot) {
			embed.extendDescription('You Win')
			const randomMessage =
				botConfig.blackjack.messages.win[
					Math.floor(Math.random() * botConfig.blackjack.messages.win.length)
				]
			embed.extendDescription(randomMessage)
			embed.setColor(Colors.Green)
		} else {
			const randomMessage =
				botConfig.blackjack.messages.lost[
					Math.floor(Math.random() * botConfig.blackjack.messages.lost.length)
				]
			embed.extendDescription(randomMessage)
			embed.setColor(Colors.Red)
		}
		cb()
		return embed.embed
	}

	return null
}

export function botResponseEmbedBuilder(blackjack: IBlackjack): EmbedBuilder {
	const embed = new EmbedBuilder().setTitle('SPCE-RACE')

	return embed
}

export function hasAnyoneWon(blackjack: IBlackjack): boolean {
	return (
		blackjack.total.bot >= getRacetrackLength(blackjack) ||
		blackjack.total.user >= getRacetrackLength(blackjack)
	)
}

export const playBlackjack = async ({
	blackjack,
	shouldPlay = true,
	chooseToStand = false,
	newRoundStarted = false,
}: {
	blackjack: IBlackjack
	shouldPlay: boolean
	chooseToStand: boolean
	newRoundStarted: boolean
}) => {
	if (!blackjack) return
	updateTotalUponBustWinOrTie(blackjack)

	if (hasAnyoneWon(blackjack)) return blackjack.save()

	if (newRoundStarted) {
		startNewRound(blackjack)
	}

	if (!checkIfCardsDistributed(blackjack)) {
		blackjack.throws.bot[0] = [rollDice(), rollDice()]
		blackjack.throws.user[0] = [rollDice(), rollDice()]
	}

	let result = updateTotalUponBustWinOrTie(blackjack)

	if (!newRoundStarted && shouldPlay) {
		if (chooseToStand) {
			// check if dealer has less than 17
			let dealerLastRoundSum = getSumOfArray(
				blackjack.throws.bot[blackjack.throws.bot.length - 1],
			)
			while (dealerLastRoundSum < 17) {
				if (dealerLastRoundSum <= 16) {
					throwDice(blackjack, 'bot')
				}
				dealerLastRoundSum = getSumOfArray(
					blackjack.throws.bot[blackjack.throws.bot.length - 1],
				)
			}
			throwDice(blackjack, 'user', 0)
		} else {
			if (!result.bot.isBustedInLastRound && !result.user.isBustedInLastRound) {
				throwDice(blackjack, 'user')

				// let dealerLastRoundSum = getSumOfArray(
				// 	blackjack.throws.bot[blackjack.throws.bot.length - 1],
				// )
				// if (dealerLastRoundSum <= 16) {
				// 	throwDice(blackjack, 'bot')
				// }
				// while (dealerLastRoundSum < 17) {
				// 	dealerLastRoundSum = getSumOfArray(
				// 		blackjack.throws.bot[blackjack.throws.bot.length - 1],
				// 	)
				// }
			}
		}
	}
	updateTotalUponBustWinOrTie(blackjack)

	blackjack.markModified('total.bot')
	blackjack.markModified('total.user')
	blackjack.markModified('throws.bot')
	blackjack.markModified('throws.user')
	blackjack.markModified('isBusted.bot')
	blackjack.markModified('isBusted.user')

	return blackjack.save()
}

function throwDice(
	blackjack: IBlackjack,
	who: 'user' | 'bot',
	value: number | 'nyb' = 'nyb',
) {
	if (value !== 'nyb') {
		blackjack.throws[who][blackjack.throws[who].length - 1].push(value)
	} else {
		blackjack.throws[who][blackjack.throws[who].length - 1].push(rollDice())
	}
}

function updateTotalUponBustWinOrTie(blackjack: IBlackjack) {
	return {
		user: calculateAndUpdateTotal(blackjack, 'user'),
		bot: calculateAndUpdateTotal(blackjack, 'bot'),
	}
}

function calculateAndUpdateTotal(blackjack: IBlackjack, who: 'user' | 'bot') {
	let total = 0
	let isBustedInLastRound = false
	let isOpponentBustedInLastRound = false

	const maxRounds = blackjack.throws[who].length - 1
	const opponent: 'bot' | 'user' = who === 'user' ? 'bot' : 'user'

	const throwsArr = Object.entries(blackjack.throws[who])
	for (let [_index, arr] of throwsArr) {
		let index = parseInt(_index)
		const sum = getSumOfArray(arr)

		if (sum > 21) {
			if (maxRounds === index) {
				isBustedInLastRound = true
			}
			continue
		} else {
			const opponentSum = getSumOfArray(blackjack.throws[opponent][index])
			if (maxRounds === index && opponentSum > 21) {
				isOpponentBustedInLastRound = true
			}
			if (
				sum === 21 ||
				opponentSum > 21 ||
				opponentSum === 21 ||
				(sum < 21 && opponentSum < 21 && index < maxRounds)
			) {
				total += sum
			}
		}
	}
	blackjack.total[who] = total

	return {
		isBustedInLastRound,
		isOpponentBustedInLastRound,
	}
}

function rollDice() {
	return getRandomNumber(botConfig.blackjack.diceD)
}

function checkIfCardsDistributed(blackjack: IBlackjack) {
	if (blackjack.throws.bot.length && blackjack.throws.user.length) {
		return blackjack.throws.bot[0].length && blackjack.throws.bot[0].length
	}
	return blackjack.throws.bot.length > 0 && blackjack.throws.user.length > 0
}
