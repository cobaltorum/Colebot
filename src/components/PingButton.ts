import { ButtonInteraction, MessageFlags } from "discord.js";

import Component from "@structures/Component.js";

export default class ExampleButton extends Component {
	constructor() {
		super({ startsWith: "ping" });
	}

	async execute(interaction: ButtonInteraction) {
		return interaction.reply({
			content: `Pong! Heartbeat: ${this.client.ws.ping}ms.`,
			flags: MessageFlags.Ephemeral
		});
	}
}

// See File: commands/Ping.ts
