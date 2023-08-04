import { ChatInputCommandInteraction } from 'discord.js'

export interface ICreateDiscordUser {
	discordId: string
	username: string
	discriminator: string
	avatar: string
	accessToken: string
	refreshToken: string
}

export interface IDiscordLean {
	avatar?: string
	discordId: string
	username: string
	discriminator: string
	is_banned: boolean
	accessToken?: string
	refreshToken?: string
	connected_wallet_address?: string
	wallet_signed_txn?: string
	original_signed_message?: string
}

export interface IDiscord extends IDiscordLean {
	_id: string
	getJwtToken(): string
	addOrRemoveFuel(value: number): void
}

export interface ITokenExchangeResponse {
	access_token: string
	token_type: string
	expires_in: number
	refresh_token: string
	scope: string
}

export interface IChatInputCommandInteraction<T>
	extends ChatInputCommandInteraction {
	discord_user?: IDiscord
}
