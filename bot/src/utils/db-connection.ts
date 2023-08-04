import { connect, set } from 'mongoose'

set('strictQuery', true)

export const mongo_connection = async () => {
	console.log('[database] started connecting to Database')
	await connect(process.env.MONGO_URL || '').then(() => {
		console.log('[database] connected to database!!!')
	})
}
