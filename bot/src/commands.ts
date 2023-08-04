import {
	SlashCommandBuilder,
	APIApplicationCommandOptionChoice,
} from 'discord.js'
import login from './interactions/login'
import {
	hasConnectedAccount,
	hasDustNft,
	hasRoleOrIsAdmin,
	hasWalletConnected,
} from './middleware/utils'
import setwallet from './interactions/setwallet'
import mywallet from './interactions/mywallet'
import { NftCategory } from '@shared/utils/nft'
import planets from './interactions/planet'
import mission from './interactions/mission'
import drip from './interactions/drip'
import profile from './interactions/profile'
import launch from './interactions/launch'
import removewallet from './interactions/removewallet'
import sendFuel from './interactions/admin/send-fuel'
import botConfig from './config/bot.config'
import sendDust from './interactions/admin/send-dust'
import racejack from './interactions/racejack'
import userInfo from './interactions/admin/user-info'
import deposit from './interactions/deposit'
import balance from './interactions/balance'
import newRace from './interactions/pvp/new-race'
import cancelRace from './interactions/pvp/cancel-race'
import showChallenges from './interactions/pvp/show-challenges'
import joinRace from './interactions/pvp/join-race'
import playPvp from './interactions/pvp/play-pvp'
import thrustPvp from './interactions/pvp/thrust-pvp'
import forceStart from './interactions/pvp/force-start'
import stabalizePvp from './interactions/pvp/stabalize-pvp'
import leaderboard from './interactions/leaderboard'
import replayPvp from './interactions/pvp/replay-pvp'

export default [
	{
		cmd: 'connect',
		middlewares: [login],
		register: new SlashCommandBuilder()
			.setName('connect')
			.setDescription('Connects your account with SPCECORP!'),
		allowed: true,
	},
	{
		cmd: 'setwallet',
		middlewares: [hasConnectedAccount(), setwallet],
		register: new SlashCommandBuilder()
			.setName('setwallet')
			.addStringOption((option) =>
				option
					.setName('address')
					.setDescription('Your wallet address')
					.setRequired(true),
			)
			.setDescription('Link your wallet address to SPCECORP!'),
		allowed: true,
	},
	{
		cmd: 'removewallet',
		middlewares: [hasConnectedAccount(), hasWalletConnected(), removewallet],
		register: new SlashCommandBuilder()
			.setName('removewallet')
			.setDescription(
				'Removes your linked wallet from SPCECORP! Note: removing wallet does not reset the timer!',
			),
		allowed: true,
	},
	{
		cmd: 'my-wallet',
		middlewares: [hasConnectedAccount(), hasWalletConnected(), mywallet],
		register: new SlashCommandBuilder()
			.setName('my-wallet')
			.setDescription('Gives you information about your linked wallet.'),
		allowed: true,
	},

	{
		cmd: 'mission',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.MECH, NftCategory.TITAN),
			mission,
		],
		register: new SlashCommandBuilder()
			.setName('mission')
			.setDescription('Go on a SPCEMECH mission and mine $DUST!'),
		allowed: true,
	},
	{
		cmd: 'planets',
		middlewares: [hasConnectedAccount(), planets],
		register: new SlashCommandBuilder()
			.setName('planets')
			.setDescription('Gives you a list of planets!'),
		allowed: true,
	},
	{
		cmd: 'drip',
		middlewares: [hasConnectedAccount(), hasWalletConnected(), drip],
		register: new SlashCommandBuilder()
			.setName('drip')
			.setDescription('Claim your fuel rewards!'),
		allowed: true,
	},
	{
		cmd: 'profile',
		middlewares: [hasConnectedAccount(), profile],
		register: new SlashCommandBuilder()
			.setName('profile')
			.setDescription('Gives you information about your account!'),
		allowed: true,
	},
	{
		cmd: 'launch',
		middlewares: [hasConnectedAccount(), hasWalletConnected(), launch],
		register: new SlashCommandBuilder()
			.setName('launch')
			.setDescription('Launch your SPCECRFT and send $DUST to your wallet.'),
		allowed: true,
	},
	{
		cmd: 'send-fuel',
		middlewares: [
			hasConnectedAccount(),
			hasRoleOrIsAdmin(botConfig.conf.roles),
			sendFuel,
		],
		register: new SlashCommandBuilder()
			.setName('send-fuel')
			.setDescription('Send fuel to another user')
			.addMentionableOption((option) =>
				option
					.setName('user')
					.setDescription('The user to send fuel to')
					.setRequired(true),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription('The amount of fuel to send')
					.setRequired(true),
			),
		allowed: true,
	},
	{
		cmd: 'send-dust',
		middlewares: [
			hasConnectedAccount(),
			hasRoleOrIsAdmin(botConfig.conf.roles),
			sendDust,
		],
		register: new SlashCommandBuilder()
			.setName('send-dust')
			.setDescription('Send dust to another user')
			.addMentionableOption((option) =>
				option
					.setName('user')
					.setDescription('The user to send fuel to')
					.setRequired(true),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription('The amount of dust to send')
					.setRequired(true),
			),
		allowed: true,
	},
	{
		cmd: 'race',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.ROCKET),
			racejack,
		],
		register: new SlashCommandBuilder()
			.setName('race')
			.setDescription('Race with your CRFT to win $DUST!'),
		allowed: true,
	},
	{
		cmd: 'user-info',
		middlewares: [
			hasConnectedAccount(),
			hasRoleOrIsAdmin(botConfig.conf.roles),
			userInfo,
		],
		register: new SlashCommandBuilder()
			.setName('user-info')
			.setDescription('Get information about a user')
			.addMentionableOption((option) =>
				option
					.setName('user')
					.setDescription('The user to get information about')
					.setRequired(true),
			),
		allowed: true,
	},
	{
		cmd: 'deposit',
		middlewares: [hasConnectedAccount(), hasWalletConnected(), deposit],
		register: new SlashCommandBuilder()
			.setName('deposit')
			.addStringOption((option) =>
				option
					.setName('transaction_id')
					.setDescription(
						'Transaction Id of the deposit you sent to bots wallet',
					)
					.setRequired(true),
			)
			.setDescription('Claim the Asset that you have sent to bots wallet!'),
		allowed: true,
	},
	{
		cmd: 'balance',
		middlewares: [hasConnectedAccount(), hasWalletConnected(), balance],
		register: new SlashCommandBuilder()
			.setName('balance')
			.setDescription('Gives you information about your balance!'),
		allowed: true,
	},
	{
		cmd: 'new-race',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.ROCKET),
			newRace,
		],
		register: new SlashCommandBuilder()
			.setName('new-race')
			.setDescription('Start a new PvP race with other players in the server!')
			.addStringOption((option) =>
				option
					.addChoices(
						...botConfig.whitelistAssetValues.map(
							(assetId): APIApplicationCommandOptionChoice<string> => ({
								name: assetId,
								value: assetId,
							}),
						),
					)
					.setName('currency_code')
					.setDescription('Which currency you want to stake in the race?')
					.setRequired(true),
			)
			.addNumberOption((option) =>
				option
					.setName('amount')
					.setDescription('How many currency you want to stake? ')
					.setRequired(true),
			),
		allowed: true,
	},
	{
		cmd: 'cancel-race',
		middlewares: [hasConnectedAccount(), hasWalletConnected(), cancelRace],
		register: new SlashCommandBuilder()
			.setName('cancel-race')
			.setDescription(
				'Cancel the PvP race that you have created! Before it has been started.',
			),
		allowed: true,
	},
	{
		cmd: 'show-pvp',
		middlewares: [hasConnectedAccount(), hasWalletConnected(), showChallenges],
		register: new SlashCommandBuilder()
			.setName('show-pvp')
			.setDescription(
				'Show the list of PvP challenges that you can join in the server!',
			),
		allowed: true,
	},
	{
		cmd: 'join-pvp',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.ROCKET),
			joinRace,
		],
		register: new SlashCommandBuilder()
			.setName('join-pvp')
			.setDescription(
				"Join the pvp using the PvP code that you've received from the challenger!",
			)
			.addStringOption((option) =>
				option.setName('code').setDescription('The PvP code').setRequired(true),
			),
		allowed: true,
	},
	{
		cmd: 'play-pvp',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.ROCKET),
			playPvp,
		],
		register: new SlashCommandBuilder()
			.setName('play-pvp')
			.setDescription(
				"Play the pvp using the PvP code that you've received from the challenger!",
			),
		allowed: true,
	},
	{
		cmd: 'thrust-pvp',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.ROCKET),
			thrustPvp,
		],
		register: new SlashCommandBuilder()
			.setName('thrust-pvp')
			.setDescription(
				"Thrust the pvp using the PvP code that you've received from the challenger!",
			),
		allowed: true,
	},
	{
		cmd: 'stablize-pvp',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.ROCKET),
			stabalizePvp,
		],
		register: new SlashCommandBuilder()
			.setName('stablize-pvp')
			.setDescription(
				"Stablize the pvp using the PvP code that you've received from the challenger!",
			),
		allowed: true,
	},
	{
		cmd: 'force-start',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.ROCKET),
			forceStart,
		],
		register: new SlashCommandBuilder()
			.setName('force-start')
			.setDescription(
				'Force start the pvp using the PvP code that you have created!',
			),
		allowed: true,
	},
	{
		cmd: 'replay-pvp',
		middlewares: [
			hasConnectedAccount(),
			hasWalletConnected(),
			hasDustNft(NftCategory.ROCKET),
			replayPvp,
		],
		register: new SlashCommandBuilder()
			.setName('replay-pvp')
			.setDescription(
				"Replay the pvp using the PvP code that you've received from the challenger!",
			)
			.addStringOption((option) =>
				option.setName('code').setDescription('The PvP code').setRequired(true),
			),
		allowed: true,
	},
	{
		cmd: 'leaderboard',
		middlewares: [hasConnectedAccount(), leaderboard],
		register: new SlashCommandBuilder()
			.setName('leaderboard')
			.setDescription('Show the leaderboard of the server!'),
		allowed: true,
	},
]
