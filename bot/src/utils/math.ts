import { IPlanetDB } from '@shared/interfaces/planet'
import botConfig from '../config/bot.config'

export function getExpLevel(exp: number) {
	if (exp < botConfig.math.experience_to_reach_lvl_one) {
		return 0
	}
	return Math.floor(
		Math.log(exp / botConfig.math.experience_to_reach_lvl_one) /
			Math.log(botConfig.math.experience_level_difficulty) +
			1,
	)
}

export function calculateFuel(
	distance_of_planet: number,
	denomination: number,
) {
	if (denomination === 0) {
		return 0
	}
	if (denomination < 0) {
		denomination = Math.abs(denomination)
	}
	return botConfig.math.base_fuel * (1 + distance_of_planet / denomination)
}

export function calculateExperience(
	distance_of_planet: number,
	denomination: number,
) {
	if (denomination === 0) {
		return 0
	}
	if (denomination < 0) {
		denomination = Math.abs(denomination)
	}
	return (
		botConfig.math.base_experience * (1 + distance_of_planet / denomination)
	)
}

export function calculateDust(
	distance_of_planet: number,
	denomination: number,
) {
	if (denomination === 0) {
		return 0
	}
	if (denomination < 0) {
		denomination = Math.abs(denomination)
	}
	return (
		botConfig.math.base_dust * (1 + distance_of_planet / (denomination * 2))
	)
}

export function calculateFuelConsumption(distance_of_planet: number) {
	return botConfig.math.fuel_charge_per_light_year * distance_of_planet
}

export function calculateRewardsAndCharges(planet: IPlanetDB) {
	const distance_of_planet = planet.distanceOfPlanet

	return {
		rewards: {
			fuel: calculateFuel(distance_of_planet, planet.denomination.fuel),
			experience: calculateExperience(
				distance_of_planet,
				planet.denomination.experience,
			),
			currencies: {
				dust: calculateDust(distance_of_planet, planet.denomination.dust),
				coup: 5000,
			},
		},
		charges: { fuelConsumption: calculateFuelConsumption(distance_of_planet) },
	}
}

export function getRandomNumber(maxLimit: number) {
	return Math.floor(Math.random() * maxLimit) + 1
}

export function getSumOfArray(arr: number[]) {
	return arr.reduce((a, b) => a + b, 0)
}

export function getSumOfNestedArray(arr: number[][]) {
	return arr.reduce((a, b) => a + getSumOfArray(b), 0)
}

export function suffleArray(arr: unknown[]): any[] {
	const newArray = []
	while (arr.length > 0) {
		const index = Math.floor(Math.random() * arr.length)
		newArray.push(arr[index])
		arr.splice(index, 1)
	}
	return newArray
}
