import {
	Racetrack,
	RacetrackModelName,
} from '@shared/utils/models/RaceTrack.model'
import { getCache, setCache } from '../redis'

async function getRacetrackCount() {
	return await Racetrack.countDocuments()
}

export async function getRandomRacetrack() {
	const fn = 'getRandomMission'

	const collectionSizeQuery = { collectionSizeQuery: 1 }
	let collectionSize = await getCache(
		collectionSizeQuery,
		fn,
		RacetrackModelName,
	)
	if (!collectionSize) {
		collectionSize = await getRacetrackCount()
		setCache(collectionSizeQuery, collectionSize, fn, RacetrackModelName)
	}
	const randomIndex = Math.floor(Math.random() * collectionSize)

	let racetrack = await getCache({ randomIndex }, fn, RacetrackModelName)
	if (!racetrack) {
		racetrack = await Racetrack.aggregate([{ $sample: { size: 1 } }])
		if (racetrack.length > 0) {
			racetrack = racetrack[0]
			setCache(
				{ randomIndex },
				racetrack,
				fn,
				RacetrackModelName,
				60 * 60 * 24 * 1,
			)
		} else {
			throw new Error('No Racetracks found')
		}
	}
	return racetrack
}
