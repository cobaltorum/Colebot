import {
	ApplicationCommandData,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags
} from "discord.js";

import Command, { CommandCategory } from "@structures/Command.js";

export default class Ping extends Command {
	constructor() {
		super({
			name: "ping",
			category: CommandCategory.Utility,
			description: `Get the bot's websocket heartbeat and API latency.`
		});
	}

	registerAppCommand(): ApplicationCommandData {
		return {
			name: this.name,
			type: ApplicationCommandType.ChatInput,
			description: this.description,
			integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
			contexts: [
				InteractionContextType.PrivateChannel,
				InteractionContextType.BotDM,
				InteractionContextType.Guild
			]
		};
	}

	async execute(interaction: ChatInputCommandInteraction) {
		const start = performance.now();
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const end = performance.now();

		const timeTaken = Math.round(end - start);
		const ws = this.client.ws.ping;

		return interaction.editReply({
			content: `Pong! Roundtrip took: ${timeTaken}ms. Heartbeat: ${ws}ms.`
		});
	}
}
