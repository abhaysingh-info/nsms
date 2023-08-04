import { Client, Events, GatewayIntentBits } from 'discord.js'
import { executeWithMiddleware } from './middleware'
import commands from './commands'

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, () => {
	console.log(`[bot] logged in as ${client.user?.tag}!`)
})

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		// await interaction.deferReply()

		if (interaction.isButton()) {
			console.log('Button from the bots embed is clicked!')
		}

		if (interaction.isChatInputCommand()) {
			for (let cmd of commands) {
				if (cmd.cmd === interaction.commandName) {
					// interaction.reply(interaction.commandName)
					executeWithMiddleware(interaction, ...cmd.middlewares)
					break
				}
			}
		}
	} catch (error: any) {
		if (process.env.NODE_ENV === 'development') {
			console.log(error)
		} else {
			console.log(error.message)
		}
	}
})

export default client
