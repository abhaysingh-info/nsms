import { Schema } from 'mongoose'
import regxr, { matchRegx } from '@shared/utils/regx'

export const UserExtentionSchema = new Schema({
	name: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 128,
		match: regxr.name,
		validate: {
			validator: (value: string) => {
				return matchRegx(value, regxr.name)
			},
		},
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
})
