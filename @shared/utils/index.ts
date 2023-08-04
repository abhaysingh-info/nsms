import { randomBytes, scrypt as _scrypt } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(_scrypt)

export async function getHash(
	password: string,
	passwordAndSaltSeperator: string = '.',
) {
	const salt = getRandomBytes(15)
	const hash = await scryptHash(password, salt)
	return `${salt}${passwordAndSaltSeperator}${hash.toString('hex')}`
}

export async function scryptHash(
	str: string,
	salt: string,
	length: number = 152,
) {
	return (await scrypt(str, salt, length)) as Buffer
}

export function getRandomBytes(length: number) {
	return randomBytes(length).toString('hex')
}
