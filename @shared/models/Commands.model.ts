// create a Commands schema which includes following fields: name, is_blocked, is_blocked_till_date, createdAt, createdBy:UserExtention, updatedOn

import { Schema, model } from 'mongoose'
import regxr, { matchRegx } from '@shared/utils/regx'
import { UserExtentionSchema } from './UserExtention.models'

export const CommandsSchema = new Schema({
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
	is_blocked: {
		type: Boolean,
		required: true,
		default: false,
	},
	is_blocked_till_date: {
		type: Date,
		required: false,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	createdBy: {
		type: UserExtentionSchema,
		ref: 'UserExtention',
		required: true,
	},
	updatedOn: {
		type: Date,
		required: false,
	},
})

export default model('Commands', CommandsSchema)
