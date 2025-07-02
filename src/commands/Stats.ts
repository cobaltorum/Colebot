import { Client, Colors, EmbedBuilder, Message } from "discord.js";
import { formatTime } from "@utils/index.js";

import Command, { CommandCategory } from "@structures/Command.js";

export default class Stats extends Command {
	constructor() {
		super({
			name: "stats",
			category: CommandCategory.Developer,
			description: "Get the bot's statistics."
		});
	}

	override async executeMessage(message: Message<true>) {
		// Only allow the bot developer to run this command.
		if (!process.env.DEVELOPER_ID) {
			return;
		}

		const { rss, heapUsed, heapTotal } = Stats._getMemoryStats();
		const { clientUptime, processUptime } = Stats._getUptimeStats(this.client);

		const embed = new EmbedBuilder()
			.setColor(Colors.NotQuiteBlack)
			.setAuthor({
				name: this.client.user.tag,
				iconURL: this.client.user.displayAvatarURL()
			})
			.setFields([
				{
					name: "Ping",
					value: `${this.client.ws.ping} ms`,
					inline: true
				},
				{
					name: "Uptime (Client / Proces)",
					value: `${clientUptime} / ${processUptime}`,
					inline: true
				},
				{
					name: "Heap Used / Heap Total / RSS",
					value: `${heapUsed} MB / ${heapTotal} MB / ${rss} MB`,
					inline: true
				}
			])
			.setFooter({ text: `Client ID: ${this.client.user.id}` })
			.setTimestamp();

		return message.channel.send({
			embeds: [embed]
		});
	}

	private static _getMemoryStats(): { rss: string; heapUsed: string; heapTotal: string } {
		const { rss, heapTotal, heapUsed } = process.memoryUsage();

		return {
			rss: (rss / 1024 / 1024).toFixed(2),
			heapUsed: (heapUsed / 1024 / 1024).toFixed(2),
			heapTotal: (heapTotal / 1024 / 1024).toFixed(2)
		};
	}

	private static _getUptimeStats(client: Client<true>): { clientUptime: string; processUptime: string } {
		const msClientUptime = Math.floor(client.uptime);
		const msProcessUptime = Math.floor(process.uptime() * 1000);

		return {
			clientUptime: formatTime(msClientUptime),
			processUptime: formatTime(msProcessUptime)
		};
	}
}
