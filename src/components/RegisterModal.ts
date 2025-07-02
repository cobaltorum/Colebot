import { MessageFlags, ModalSubmitInteraction } from "discord.js";

import Component from "@structures/Component.js";

export default class ExampleModal extends Component {
	constructor() {
		super({ startsWith: "register" });
	}

	async execute(interaction: ModalSubmitInteraction) {
		const username = interaction.fields.getTextInputValue("username");

		return interaction.reply({
			content: `Nice to meet you, ${username}!`,
			flags: MessageFlags.Ephemeral
		});
	}
}

// See File: commands/Register.ts
