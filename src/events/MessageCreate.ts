import { Events, Message } from "discord.js";

import Logger from "@utils/Logger.js";
import EventListener from "@structures/EventListener.js";
import CommandManager from "@managers/client/CommandManager.js";

export default class MessageCreate extends EventListener {
	constructor() {
		super(Events.MessageCreate);
	}

	async execute(message: Message<true>) {
		if (message.author.bot || !message.member || message.webhookId) return;
		if (!message.channel.permissionsFor(message.guild.members.me!)) return;

		const prefix = process.env.DEFAULT_PREFIX!;
		const trimmedContent = message.content.slice(prefix.length).trim();
		const spaceIndex = trimmedContent.indexOf(" ");

		const commandName = spaceIndex === -1 ? trimmedContent : trimmedContent.slice(0, spaceIndex);
		const command = CommandManager.get(commandName);

		if (!command) {
			return;
		}

		if (!command.executeMessage) {
			const reply = await message.reply({
				content: `This command cannot be executed.`
			});

			return setTimeout(() => {
				reply.delete().catch(() => null);
			}, 7500);
		}

		const parameters = spaceIndex === -1 ? "" : trimmedContent.substring(spaceIndex + 1).trim();
		const args = command.getArgsClass(message, parameters);

		try {
			await command.executeMessage!(message, args);
		} catch (error) {
			Logger.error(`An error occurred while executing a message command:`, error);

			return message.channel.send({
				content: `An error occurred while executing the command.`
			});
		}
	}
}
