import {
	ActionRowBuilder,
	ApplicationCommandData,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	StringSelectMenuBuilder
} from "discord.js";

import { SelectMenuOptions } from "@utils/Constants.js";

import Command, { CommandCategory } from "@structures/Command.js";

export default class Color extends Command {
	constructor() {
		super({
			name: "color",
			category: CommandCategory.General,
			description: "Pick your favorite color."
		});
	}

	override registerAppCommand(): ApplicationCommandData {
		return {
			name: this.name,
			type: ApplicationCommandType.ChatInput,
			description: this.description,
			integrationTypes: [ApplicationIntegrationType.GuildInstall],
			contexts: [InteractionContextType.Guild]
		};
	}

	override async executeInteraction(interaction: ChatInputCommandInteraction) {
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("color-menu")
			.setPlaceholder("Select color...")
			.setOptions(SelectMenuOptions);

		const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);

		return interaction.reply({
			content: `Pick your favorite color below!`,
			components: [actionRow]
		});
	}
}
