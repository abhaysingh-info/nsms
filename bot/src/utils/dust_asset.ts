export default {
	name: 'Dust',
	phrase: process.env.DUST_WALLET_PHRASE,
	asset_id: parseInt(`${process.env.DUST_ASSET_ID}`) || 0,
	send_amount: 10,
	cooldown_in_seconds: 60 * 60 * 1,
}
