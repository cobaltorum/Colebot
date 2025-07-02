import { Events, Interaction, MessageFlags } from "discord.js";

import Logger from "@utils/Logger.js";
import Command from "@structures/Command.js";
import Component from "@structures/Component.js";
import EventListener from "@structures/EventListener.js";
import CommandManager from "@managers/client/CommandManager.js";
import ComponentManager from "@managers/client/ComponentManager.js";

export default class InteractionCreate extends EventListener {
	constructor() {
		super(Events.InteractionCreate);
	}

	async execute(interaction: Interaction): Promise<unknown> {
		/**
		 * By default, this event does not handle autocomplete interactions.
		 * If you want to introduce autocomplete to your commands, you'll need to modify this if statement.
		 *
		 * @example
		 * if (interaction.isAutocomplete()) {
		 *   // Handle autocomplete interaction with a custom function.
		 *      return handleAutocomplete(interaction);
		 *  }
		 */

		if (interaction.isAutocomplete()) {
			throw new Error("Autocomplete interactionsm are not supported.");
		}

		const data = interaction.isCommand()
			? CommandManager.get(interaction.commandName)
			: ComponentManager.get(interaction.customId);

		if (!data) {
			const type = interaction.isCommand() ? "Command" : "Component";

			await interaction.reply({
				content: `${type} not found.`,
				flags: MessageFlags.Ephemeral
			});

			return setTimeout(() => {
				interaction.deleteReply().catch(() => null);
			}, 7500);
		}

		if (data instanceof Command && !data.executeInteraction) {
			await interaction.reply({
				content: `This command cannot be executed.`,
				flags: MessageFlags.Ephemeral
			});

			return setTimeout(() => {
				interaction.deleteReply().catch(() => null);
			}, 7500);
		}

		try {
			if (interaction.isCommand()) {
				await (data as Command).executeInteraction!(interaction);
			} else {
				await (data as Component).execute(interaction);
			}
		} catch (error) {
			Logger.error(`An error occurred while executing an interaction:`, error);

			return interaction.deferred || interaction.replied
				? interaction.editReply({
						content: `An error occurred while executing the interaction.`
					})
				: interaction.reply({
						content: `An error occurred while executing the interaction.`,
						flags: MessageFlags.Ephemeral
					});
		}
	}
}
