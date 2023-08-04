import { Planet, PlanetModelName } from '@shared/utils/models/Planet.model'
import { getCache, setCache } from '../redis'
import { IPlanetDB } from '@shared/interfaces/planet'
import { StringSelectMenuBuilder, EmbedBuilder } from 'discord.js'
import botConfig from '../../config/bot.config'
import { calculateRewardsAndCharges } from '../math'
import { IDiscord } from '@shared/interfaces/discord'
import { IStringKey } from '@shared/interfaces'

export async function getPlanets(startFrom: number, limit: number = 10) {
	const query = { skip: startFrom, limit: limit, sort: { created_at: -1 } }
	const fn = 'getPlanets'
	let planets = await getCache(query, fn, PlanetModelName)
	if (!planets) {
		planets = await Planet.find()
			.skip(startFrom)
			.limit(limit)
			.sort({ created_at: -1 })
			.lean()
		setCache(query, planets, fn, PlanetModelName)
	}
	return planets
}

export async function getPlanetsDistinct(
	startFrom: number,
	limit: number = 10,
) {
	const fn = 'getPlanetsDistinct'
	const query = {
		skip: startFrom,
		select: { name: 1, _id: 1, description: 1 },
		limit: limit,
		sort: { created_at: -1 },
	}
	// await deleteCache(query, fn, PlanetModelName)
	let planets = await getCache(query, fn, PlanetModelName)
	if (!planets) {
		planets = await Planet.find({}, query.select)
			.skip(query.skip)
			.limit(query.limit)
			.sort({ created_at: -1 })
			.lean()
		setCache(query, planets, fn, PlanetModelName)
	}
	return planets
}

export async function getPlanetListAndCreateDiscordDropdown(
	startFrom: number,
	limit: number = 5,
) {
	const planet = (await getPlanets(startFrom, limit)) || ([] as any[])
	const planetForDropDown = planet.map((planet: IPlanetDB, index: number) => ({
		label: `${
			startFrom + index + 1
		}) ${planet.name[0].toUpperCase()}${planet.name.slice(1)}`,
		description: `${planet.description.slice(0, 90)}${
			planet.description.length > 90 ? '...' : ''
		}`,
		value: `${planet._id}`,
	}))
	let dropdown = new StringSelectMenuBuilder()
		.setCustomId(botConfig.mission.DropdownInteractionCustomID)
		.setPlaceholder('Nothing selected')
	if (planetForDropDown.length === 0) {
		dropdown = dropdown
			.setDisabled(true)
			.setPlaceholder('No planets found')
			.addOptions({
				label: 'No planets found',
				description: 'No planets found',
				value: 'no-planet-found',
			})
	} else {
		dropdown = dropdown.addOptions(...planetForDropDown)
	}

	return {
		planetsLength: planet.length,
		dropdown,
		planet,
	}
}

export function getPlanetsEmbed(planet: IPlanetDB, discordUser: IDiscord) {
	const rewardsAndCharges = calculateRewardsAndCharges(planet)
	const rewardsString = Object.keys(rewardsAndCharges.rewards.currencies)
		.map(
			(currency) =>
				`${currency.toUpperCase()}: ${(
					rewardsAndCharges.rewards.currencies as IStringKey<number>
				)[currency].toFixed(2)} ${
					(botConfig.emoji as IStringKey<string>)[currency]
				}`,
		)
		.join('\n')
	const fields = [
		{
			name: 'Distance of Planet',
			value: `${planet.distanceOfPlanet.toFixed(2)} light years`,
			inline: true,
		},
		{
			name: ' ',
			value: ' ',
			inline: false,
		},
		{
			name: 'Rewards',
			value: `Fuel: ${rewardsAndCharges.rewards.fuel.toFixed(2)} ${
				botConfig.emoji.fuel
			}\nExperience: ${rewardsAndCharges.rewards.experience.toFixed(
				2,
			)}\n${rewardsString}`,
			inline: true,
		},
		{
			name: 'Charges',
			value: `Fuel Consumption: ${rewardsAndCharges.charges.fuelConsumption.toFixed(
				2,
			)} ${botConfig.emoji.fuel}`,
			inline: true,
		},
	]

	if (discordUser.games.fuel < rewardsAndCharges.charges.fuelConsumption) {
		fields.push({
			name: ' ',
			value: `You don't have enough fuel to travel to this planet. You need at least ${rewardsAndCharges.charges.fuelConsumption} ${botConfig.emoji.fuel} to travel to this planet.`,
			inline: false,
		})
	}

	const embed = new EmbedBuilder()
		.setTitle(
			`${planet.name[0].toUpperCase()}${planet.name.slice(1).toLowerCase()}`,
		)
		.setDescription(`${planet.description.slice(0, 1512)}`)
		.addFields(fields)

	return { embed, rewardsAndCharges }
}
