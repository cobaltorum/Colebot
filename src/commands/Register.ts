import {
	ActionRowBuilder,
	ApplicationCommandData,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from "discord.js";

import Command, { CommandCategory } from "@structures/Command.js";

export default class Register extends Command {
	constructor() {
		super({
			name: "register",
			category: CommandCategory.General,
			description: "Register yourself."
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
		const usernameInput = new TextInputBuilder()
			.setCustomId("username")
			.setLabel("Username")
			.setPlaceholder(`Enter your username.`)
			.setRequired(true)
			.setMaxLength(128)
			.setStyle(TextInputStyle.Paragraph);

		const actionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(usernameInput);
		const modal = new ModalBuilder().setCustomId("register").setTitle(`Registering`).setComponents(actionRow);

		return interaction.showModal(modal);
	}
}
