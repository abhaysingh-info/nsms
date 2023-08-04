import { Schema, model, HydratedDocument } from 'mongoose'
import jwt from 'jsonwebtoken'
import { IDiscord } from '@shared/interfaces/discord'

export const DiscordUserSchema: Schema<IDiscord> = new Schema<IDiscord>({
	avatar: {
		type: String,
		required: false,
	},
	discordId: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
	},
	discriminator: {
		type: String,
		required: true,
	},
	is_banned: {
		type: Boolean,
		required: true,
		default: false,
	},
	accessToken: {
		type: String,
		required: false,
	},
	refreshToken: {
		type: String,
		required: false,
	},
})

DiscordUserSchema.methods.getJwtToken = function () {
	return jwt.sign({ id: this.discordId }, process.env.JWT_SECRET as string, {
		expiresIn: process.env.JWT_EXPIRE,
	})
}

DiscordUserSchema.methods.addOrRemoveFuel = function (value: number) {
	if (value < 0 && this.games.fuel - value < 0) {
		this.games.fuel = 0
	} else {
		this.games.fuel += value
	}

	if (value > 0) {
		this.games.cumulativeFuel += value
	}
}

const _DiscordUserModalName = 'discorduser'

// export the model and add type for discord user
export const DiscordUser = model(_DiscordUserModalName, DiscordUserSchema)

export const DiscordUserModelName = _DiscordUserModalName + 's'

export type DiscordUserDocument = HydratedDocument<typeof DiscordUser>

export default DiscordUser
