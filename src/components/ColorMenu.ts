import { MessageFlags, StringSelectMenuInteraction } from "discord.js";

import Component from "@structures/Component.js";

export default class ExampleSelectMenu extends Component {
	constructor() {
		super({ startsWith: "color-menu" });
	}

	async execute(interaction: StringSelectMenuInteraction) {
		const [selected] = interaction.values;

		return interaction.reply({
			content: selected,
			flags: MessageFlags.Ephemeral
		});
	}
}

// See File: commands/Color.ts
