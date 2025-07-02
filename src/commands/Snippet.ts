import {
	ApplicationCommandData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags
} from "discord.js";

import { lmdb } from "@/index.js";
import Command, { CommandCategory } from "@structures/Command.js";

export default class Snippet extends Command {
	constructor() {
		super({
			name: "snippet",
			category: CommandCategory.Utility,
			description: `Snippet related commands.`
		});
	}

	override registerAppCommand(): ApplicationCommandData {
		return {
			name: this.name,
			type: ApplicationCommandType.ChatInput,
			description: this.description,
			integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
			contexts: [
				InteractionContextType.Guild,
				InteractionContextType.BotDM,
				InteractionContextType.PrivateChannel
			],
			options: [
				{
					name: SnippetSubcommand.Create,
					description: "Create a snippet.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "name",
							description: "The snippet's name.",
							type: ApplicationCommandOptionType.String,
							required: true
						},
						{
							name: "content",
							description: "The snippet's content.",
							type: ApplicationCommandOptionType.String,
							required: true
						}
					]
				},
				{
					name: SnippetSubcommand.Delete,
					description: "Delete a snippet.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "name",
							description: "The snippet's name.",
							type: ApplicationCommandOptionType.String,
							required: true
						}
					]
				},
				{
					name: SnippetSubcommand.Update,
					description: "Update a snippet's content.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "name",
							description: "The snippet's name.",
							type: ApplicationCommandOptionType.String,
							required: true
						},
						{
							name: "new-content",
							description: "The snippet's new content.",
							type: ApplicationCommandOptionType.String,
							required: true
						}
					]
				},
				{
					name: SnippetSubcommand.Show,
					description: "Show a snippet.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "name",
							description: "The snippet's name",
							type: ApplicationCommandOptionType.String,
							required: true
						},
						{
							name: "ephemeral",
							description: "Whether the response should only be visible to you.",
							type: ApplicationCommandOptionType.Boolean,
							required: false
						}
					]
				}
			]
		};
	}

	async execute(interaction: ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand(true) as SnippetSubcommand;

		switch (subcommand) {
			case SnippetSubcommand.Create: {
				const name = interaction.options.getString("name", true);
				const content = interaction.options.getString("content", true);

				const exists = lmdb.get(`snippets~${interaction.user.id}:${name}`);

				if (exists) {
					return interaction.reply({
						content: `A snippet with the name \`${name}\` already exists.`,
						flags: MessageFlags.Ephemeral
					});
				}

				await lmdb.put(`snippets~${interaction.user.id}:${name}`, content);

				return interaction.reply({
					content: `Successfully created a new snippet with the name \`${name}\`.`,
					flags: MessageFlags.Ephemeral
				});
			}

			case SnippetSubcommand.Delete: {
				const name = interaction.options.getString("name", true);
				const exists = lmdb.get(`snippets~${interaction.user.id}:${name}`);

				if (!exists) {
					return interaction.reply({
						content: `No snippet with the name \`${name}\` found to delete.`,
						flags: MessageFlags.Ephemeral
					});
				}

				await lmdb.remove(`snippets~${interaction.user.id}:${name}`);

				return interaction.reply({
					content: `Successfully deleted the snippet with name \`${name}\`.`,
					flags: MessageFlags.Ephemeral
				});
			}

			case SnippetSubcommand.Update: {
				const name = interaction.options.getString("name", true);
				const newContent = interaction.options.getString("new-content", true);

				const exists = lmdb.get(`snippets~${interaction.user.id}:${name}`);

				if (!exists) {
					return interaction.reply({
						content: `No snippet with the name \`${name}\` found to update.`,
						flags: MessageFlags.Ephemeral
					});
				}

				await lmdb.put(`snippets~${interaction.user.id}:${name}`, newContent);
				return interaction.reply({
					content: `Successfully updated the snippet with name \`${name}\`.`,
					flags: MessageFlags.Ephemeral
				});
			}

			case SnippetSubcommand.Show: {
				const name = interaction.options.getString("name", true);
				const ephemeral = interaction.options.getBoolean("ephemeral", false) ?? false;

				const content = lmdb.get(`snippets~${interaction.user.id}:${name}`);

				if (!content) {
					return interaction.reply({
						content: `Snippet with name \`${name}\` not found.`,
						flags: MessageFlags.Ephemeral
					});
				}

				return interaction.reply({
					content,
					flags: ephemeral ? MessageFlags.Ephemeral : undefined
				});
			}
		}
	}
}

const SnippetSubcommand = {
	Create: "create",
	Delete: "delete",
	Update: "update",
	Show: "show"
} as const;
type SnippetSubcommand = (typeof SnippetSubcommand)[keyof typeof SnippetSubcommand];
