// import { photo } from './common'

export type ItokenTypes =
	| 'emailVerifyToken'
	| 'emailResetToken'
	| 'passwordResetToken'
	| 'token'

export type IRoles = 'NOROLE' | 'CLIENT' | 'ADMIN' | 'BROKER'

export interface IUser {
	_id: string
	name: string
	email: string
	isEmailVerified: boolean
	emailVerifyToken: string
	emailResetToken: string
	emailResetTokenExpiry: Date | null
	password: string
	passwordResetToken: string
	passwordResetTokenExpiry: Date | null
	passwordTries: number
	roles: string
	suspended: boolean
	isBlocked: boolean
	token: string
	tokenExpiry: Date | null
}

export interface IVerifyUser {
	_id: string
	email: string
	isBlocked: boolean
	suspended: boolean
	isEmailVerified: boolean
	name: string
	roles: IRoles
}

export interface ICreateUser {
	name: string
	email: string
	countryCode: string
	phoneNumber: string
	password: string
}
export interface ILoginUser {
	email: string
	password: string
}
