import { Racetrack } from '@shared/utils/models/RaceTrack.model'
import { IRacetrack } from '@shared/interfaces/racetrack'
import { mongo_connection } from '../utils/db-connection'

const raceTracks: IRacetrack[] = [
	{
		name: 'Cosmic Canyon',
		description:
			'a treacherous asteroid field and past stunning cosmic formations, with tight turns and sudden obstacles.',
		raceTrackLength: 62,
	},
	{
		name: 'Starlight Speedway',
		description:
			'a treacherous asteroid field and past stunning cosmic formations, with tight turns and sudden obstacles.',
		raceTrackLength: 72,
	},
	{
		name: 'Lunar Labyrinth',
		description:
			'a treacherous asteroid field and past stunning cosmic formations, with tight turns and sudden obstacles.',
		raceTrackLength: 52,
	},
	{
		name: 'Galactic Grand Prix',
		description:
			'a treacherous asteroid field and past stunning cosmic formations, with tight turns and sudden obstacles.',
		raceTrackLength: 84,
	},
	{
		name: 'Nebula Nerve',
		description:
			'a treacherous asteroid field and past stunning cosmic formations, with tight turns and sudden obstacles.',
		raceTrackLength: 96,
	},
]

async function main() {
	await mongo_connection()
	for (const raceTrack of raceTracks) {
		const newRaceTrack = new Racetrack(raceTrack)
		await newRaceTrack.save()
	}
	console.log('done')
}

main()
