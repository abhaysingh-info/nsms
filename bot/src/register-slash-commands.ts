import './Env'
import { REST, Routes } from 'discord.js'
import commands from './commands'

const rest = new REST({ version: '10' }).setToken(`${process.env.BOT_TOKEN}`)

;(async () => {
	try {
		console.log('Started refreshing application (/) commands.')
		const cmd = commands.filter((cmd) => cmd.allowed).map((cmd) => cmd.register)

		const regCmd: any = await rest.get(
			Routes.applicationCommands(process.env.BOT_ID || ''),
		)

		await Promise.all(
			regCmd.map((cmd: any) =>
				rest.delete(
					Routes.applicationCommand(process.env.BOT_ID || '', cmd.id),
				),
			),
		)

		await rest.put(Routes.applicationCommands(process.env.BOT_ID || ''), {
			body: cmd,
		})

		console.log('Successfully reloaded application (/) commands.')
	} catch (error) {
		console.error(error)
	}
})()
