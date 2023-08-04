const murl =
	'mongodb+srv://terminator:Z38hON2MtM3oqNVQ@dust.hduee.mongodb.net/dust'
// import mongodb and create a connection using murl variable

;(async () => {
	const mongodb = require('mongodb')
	const MongoClient = mongodb.MongoClient
	const client = new MongoClient(murl, { useUnifiedTopology: true })
	// connect to mongodb
	await client.connect()
	// get the database
	const db = client.db('dust')
	// get the collection
	const collection = db.collection('discordusers')
	// get the data from the collection
	const data = await collection.find().toArray()
	let coupTotal = 0
	let dustTotal = 0
	let withdrawTotal = 0
	let exp = 0

	// loop through the data
	console.log(data.length)
	for (let i = 0; i < data.length; i++) {
		// get the data
		const user = data[i]
		coupTotal += user.currencies.coup
		dustTotal += user.currencies.dust
		withdrawTotal += user.wallet.syncedDust
		exp += user.experience
	}
	console.log('Coup TOTAL: ', coupTotal)
	console.log('Dust TOTAL: ', dustTotal)
	console.log('Synced Dust TOTAL: ', withdrawTotal)
	console.log('Dust Final TOTAL: ', dustTotal + withdrawTotal)
	console.log('Exp TOTAL: ', exp)
	// disconnect from mongodb
	client.close()
	// return the data
	return data
})()
