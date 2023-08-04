import algosdk from 'algosdk'
import { getCache, setCache } from './redis'
import dust_asset from './dust_asset'
import axios from 'axios'

const server = process.env.ALGOD_ADDRESS || ''

const DUST_ACCOUNT = algosdk.mnemonicToSecretKey(
	process.env.DUST_WALLET_PHRASE || '',
)

const PVP_WALLET_ADDRESS = process.env.PVP_WALLET_ADDRESS || ''

const client = new algosdk.Algodv2('', server, '')

export const connectAlgo = async () => {
	console.log('[algorand] connecting to server...')
	await client.status().do()
	console.log('[algorand] connected!!!')
}

export async function getTransaction(transactionId: string) {
	const apiUrl = `${process.env.PURESTAKE_EXPLORER_API}/idx2/v2/transactions/`
	const apiKey = process.env.PURE_STAKE_API_KEY || ''

	try {
		const response = await axios.get(`${apiUrl}${transactionId}`, {
			headers: {
				accept: 'application/json',
				'x-api-key': apiKey,
			},
		})

		return response.data
	} catch (error) {
		console.error('Error fetching transaction details:', error)
		return null
	}
}

export async function getAccountInfo(wallet_address: string) {
	const fn = 'getAccountInfo'
	const model = 'account_info'
	try {
		const key = `getAccountInfo()account_info:${wallet_address}`
		let account_info = await getCache(key, fn, model)
		if (!account_info) {
			account_info = await client.accountInformation(wallet_address).do()
			if (account_info) {
				await setCache(key, account_info, fn, model, 60 * 5)
			}
		}
		return account_info
	} catch (error: any) {
		throw new Error("Couldn't get account info")
	}
}

export async function getAssetInfo(asset_id: number) {
	const fn = 'getAssetInfo'
	const model = 'asset_info'
	try {
		const key = `getAssetInfo()asset_info:${asset_id}`

		let asset_info = await getCache(key, fn, model)
		if (!asset_info) {
			asset_info = await client.getAssetByID(asset_id).do()
			if (asset_info) {
				await setCache(key, asset_info, fn, model, 60 * 60 * 24 * 7)
			}
		}
		return asset_info
	} catch {
		throw new Error("Couldn't get asset info")
	}
}
export async function transferAsset(
	to_wallet_address: string,
	_amount: number = 0,
) {
	try {
		const params = await client.getTransactionParams().do()

		const revocationTarget = undefined
		const closeRemainderTo = undefined

		const amount = Math.floor(_amount)

		const asset_id = dust_asset.asset_id

		const text_encoder = new TextEncoder()

		const note = text_encoder.encode(
			`SpaceCorp sent you ${amount} $DUST from DUST's discord server`,
		)

		let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
			DUST_ACCOUNT.addr,
			to_wallet_address,
			closeRemainderTo,
			revocationTarget,
			amount,
			note,
			asset_id,
			params,
		)

		const rawSignedTxn = xtxn.signTxn(DUST_ACCOUNT.sk)

		try {
			let xtx = await client.sendRawTransaction(rawSignedTxn).do()
			return xtx
		} catch (error: any) {
			if (error.status === 400) {
				return {
					error: true,
					message: `Please opt-in to the asset first. ASA ID is ${asset_id}`,
				}
			}
			return {
				error: true,
				message: error.message,
			}
		}
	} catch (error) {
		throw new Error("Couldn't transfer asset")
	}
}

export function isValidWalletAddress(wallet_address: string) {
	return algosdk.isValidAddress(wallet_address)
}

export async function checkTransaction(
	senderAddress: string,
	transactionId: string,
	asaIds: string[],
): Promise<{
	success: boolean
	message: string
	data?: {
		amount: number
		asset_id: number
		transaction_id: string
		sender_address: string
		receiver_address: string
	}
}> {
	// const accountInfo = await client.accountInformation(senderAddress).do()
	let txn = undefined
	try {
		txn = await getTransaction(transactionId)
	} catch (error) {
		return {
			success: false,
			message:
				'failed to get transaction from the blockchain, please try again in some time',
		}
	}
	if (!txn) {
		return {
			success: false,
			message:
				'failed to get transaction from the blockchain, please try again in some time',
		}
	}

	const transaction = txn.transaction

	if (transaction['tx-type'] !== 'axfer') {
		return {
			success: false,
			message: 'transaction type is not asset transfer',
		}
	}

	const transactionReceiverInfo = transaction['asset-transfer-transaction']
	const transactionReceiverAddress = transactionReceiverInfo.receiver
	const transactionSenderAddress = transaction.sender

	if (
		!transactionReceiverAddress ||
		!transactionSenderAddress ||
		!transactionReceiverInfo.amount
	) {
		return {
			success: false,
			message: 'transaction data is not valid',
		}
	}

	// Check if receiver's address matches the parameter
	if (transactionReceiverAddress !== PVP_WALLET_ADDRESS) {
		return {
			success: false,
			message: 'Receiver address does not match',
		}
	}

	// Check if sender's address matches the parameter
	if (transactionSenderAddress !== senderAddress) {
		return {
			success: false,
			message: 'Sender address does not match',
		}
	}

	// Check if the ASA ID sent in the transaction exists in the provided ASA IDs
	const assetId = transactionReceiverInfo['asset-id']
	if (!asaIds.includes(assetId.toString())) {
		return {
			success: false,
			message: `ASA ID not found, We don't support ${
				assetId || ''
			}, If you think it's a mistake please contact our moderators`,
		}
	}

	let asset = null
	try {
		asset = await getAssetInfo(parseInt(assetId))
	} catch (error) {
		return {
			success: false,
			message: 'failed to get asset info',
		}
	}

	if (!asset) {
		return {
			success: false,
			message: 'failed to get asset info',
		}
	}

	let amount = transactionReceiverInfo.amount

	const { params } = asset

	if (params.decimals) {
		amount = amount / Math.pow(10, params.decimals)
	}
	// Return the sender's wallet address, ASA ID, and amount of ASA ID sent in the transaction
	return {
		success: true,
		message: 'Transaction is valid',
		data: {
			sender_address: senderAddress,
			asset_id: assetId,
			transaction_id: transactionId,
			amount,
			receiver_address: transactionReceiverAddress,
		},
	}
}

export async function getAssetsCreated(wallet_address: string) {
	const fn = 'getAssetsCreated'
	const model = 'assets_created'
	try {
		const key = `getAssetsCreated()assets_created:${wallet_address}`
		let assets_created = await getCache(key, fn, model)
		if (!assets_created) {
			assets_created = await client.accountInformation(wallet_address).do()
			if (assets_created) {
				await setCache(key, assets_created, fn, model, 60 * 5)
			}
		}
		return assets_created
	} catch (error: any) {
		throw new Error("Couldn't get assets created")
	}
}

export async function getAssetBalance(asset_id: string) {
	const apiUrl = `${process.env.PURESTAKE_EXPLORER_API}/idx2/v2/assets/${asset_id}/balances`
	const apiKey = process.env.PURE_STAKE_API_KEY || ''

	try {
		const response = await axios.get(apiUrl, {
			headers: {
				accept: 'application/json',
				'x-api-key': apiKey,
			},
		})

		return response.data
	} catch (error) {
		console.error('Error fetching transaction details:', error)
		return null
	}
}
