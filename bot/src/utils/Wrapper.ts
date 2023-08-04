export default async function (callback: Function) {
	try {
		return await callback()
	} catch (error: any) {
		if (process.env.NODE_ENV === 'development') {
			console.log(error.message)
			console.log(error.status)
			console.log(error.code)
		} else {
			console.log(error.message)
		}
	}
}
