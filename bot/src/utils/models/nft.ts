import { deleteCache, getCache, setCache } from '../redis'
import { Nft } from '@shared/utils/models/Nft.model'
import { INftCategory } from '@shared/interfaces/nft'

export async function getNftIn(
	asset_ids: number[],
	categories: INftCategory[],
) {
	const query = {
		asset_id: { $in: asset_ids },
		category: {
			$in: categories,
		},
	}
	const fn = 'getNftIn'
	const model = 'Nft'
	let output = await getCache({ query, name: 'getNFtIn' }, fn, model)
	if (!output) {
		output = await Nft.find(query).lean()
		await setCache(query, output, fn, model, 60 * 60 * 24) // caching for 24 hours
	}
	return output
}

export async function getNftInCount(
	asset_ids: number[],
	category: INftCategory,
) {
	const query = { asset_id: { $in: asset_ids }, category }
	const fn = 'getNftInCount'
	const model = 'Nft'
	await deleteCache({ query, name: 'getNftInCount' }, fn, model)
	let output = await getCache({ query, name: 'getNftInCount' }, fn, model)
	if (!output) {
		output = (await Nft.countDocuments(query)) || 0
		// await setCache(query, output, fn, model, 60 * 60 * 1) // caching for 1 hours
	}
	return output
}
