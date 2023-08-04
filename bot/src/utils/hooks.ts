import axios from 'axios'

export async function sendToSpceLog(
	message: any = {},
	initiatedByUserId: string | Array<string> = process.env.BOT_ID || '',
) {
	const hookUrl = process.env.DISCORD_SPCE_LOG_HOOK || ''

	// send message to discord using the hookUrl with help of axios
	if (!message['content']) {
		message['content'] = ''
	}
	try {
		if (typeof initiatedByUserId === typeof []) {
			message['content'] += `<@${(initiatedByUserId as string[]).join('> <@')}>`
		} else {
			message['content'] += `<@${initiatedByUserId}>`
		}
		const resp = await axios.post(hookUrl, message)
		return resp
	} catch (error: any) {
		console.log(error.message)
	}
}

export async function sendAdminLog(
	message: any = {},
	initiatedByUserId: string | Array<string> = process.env.BOT_ID || '',
) {
	const hookUrl = process.env.DISCORD_ADMIN_LOG_HOOK || ''
	// send message to discord using the hookUrl with help of axios
	if (!message['content']) {
		message['content'] = ''
	}
	try {
		if (typeof initiatedByUserId === typeof []) {
			message['content'] += `<@${(initiatedByUserId as string[]).join('> <@')}>`
		} else {
			message['content'] += `<@${initiatedByUserId}>`
		}
		const resp = await axios.post(hookUrl, message)
		return resp
	} catch (error: any) {
		console.log(error.message)
	}
}

export async function sendPvpLog(
	message: any = {},
	initiatedByUserId: string | Array<string> = process.env.BOT_ID || '',
) {
	const hookUrl = process.env.DISCORD_PVP_LOG_HOOK || ''
	// send message to discord using the hookUrl with help of axios
	if (!message['content']) {
		message['content'] = ''
	}
	try {
		if (typeof initiatedByUserId === typeof []) {
			message['content'] += `<@${(initiatedByUserId as string[]).join('> <@')}>`
		} else {
			message['content'] += `<@${initiatedByUserId}>`
		}
		const resp = await axios.post(hookUrl, message)
		return resp
	} catch (error: any) {
		console.log(error.message)
	}
}

export async function sendPvpTurnLog(message: any = {}) {
	const hookUrl = process.env.DISCORD_PVP_TURN_LOG_HOOK || ''
	// send message to discord using the hookUrl with help of axios
	if (!message['content']) {
		message['content'] = ''
	}
	try {
		const resp = await axios.post(hookUrl, message)
		return resp
	} catch (error: any) {
		console.log(error.message)
	}
}

export async function sendPvpWinnerLog(
	message: any = {},
	initiatedByUserId: string | Array<string> = process.env.BOT_ID || '',
) {
	const hookUrl = process.env.DISCORD_PVP_WINNER_LOG_HOOK || ''
	// send message to discord using the hookUrl with help of axios
	if (!message['content']) {
		message['content'] = ''
	}
	try {
		if (typeof initiatedByUserId === typeof []) {
			message['content'] += `<@${(initiatedByUserId as string[]).join('> <@')}>`
		} else {
			message['content'] += `<@${initiatedByUserId}>`
		}
		const resp = await axios.post(hookUrl, message)
		return resp
	} catch (error: any) {
		console.log(error.message)
	}
}
