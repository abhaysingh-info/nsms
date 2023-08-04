import { Transaction } from '@shared/utils/models/Transactions.model'
import { ITransaction, ITransactionType } from '@shared/interfaces/transactions'
import { sendAdminLog } from '../hooks'

// create a logger that
export async function transactionLogger(txn: ITransaction): Promise<boolean> {
	const transaction: ITransaction = {
		discordUserId: txn.discordUserId,
		currentWalletAddress: txn.currentWalletAddress,
		currencies: txn.currencies,
		transactionType: txn.transactionType,
		experience: txn.experience,
		note: txn.note,
		fuel: txn.fuel,
	}
	try {
		const txn = await Transaction.create(transaction)
		if (txn) return true
		return false
	} catch (error: any) {
		sendAdminLog({
			content: `Failed to log transaction: ${
				error.message
			}\`\`\`${JSON.stringify(transaction)}\`\`\``,
		})
		return false
	}
}
