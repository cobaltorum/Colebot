import {
	ApplicationCommandData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	BaseMessageOptions,
	ChatInputCommandInteraction,
	InteractionContextType,
	Message
} from "discord.js";

import { Args } from "@structures/Args.js";
import Command, { CommandCategory } from "@structures/Command.js";

const options: BaseMessageOptions = {
	allowedMentions: { parse: ["users"] }
};

export default class Greet extends Command {
	constructor() {
		super({
			name: "greet",
			aliases: ["hi"],
			category: CommandCategory.General,
			description: "Greet another person."
		});
	}

	override registerAppCommand(): ApplicationCommandData {
		return {
			name: this.name,
			type: ApplicationCommandType.ChatInput,
			description: this.description,
			integrationTypes: [ApplicationIntegrationType.GuildInstall],
			contexts: [InteractionContextType.Guild],
			options: [
				{
					name: "target",
					description: "The user to greet.",
					type: ApplicationCommandOptionType.User,
					required: true
				}
			]
		};
	}

	override async executeMessage(message: Message<true>, args: Args) {
		// If there are no available arguments.
		if (args.finished) {
			return message.channel.send({
				content: `${message.author}, you must provide a user to greet.`,
				...options
			});
		}

		// In this case, this will attempt to retrieve a member from the first argument in the parser.
		const target = await args.getMember();

		if (!target) {
			return message.channel.send({
				content: `${message.author}, that is not a valid user.`,
				...options
			});
		}

		return message.channel.send({
			content: `${target}, you have a greeting from ${message.author}!`,
			...options
		});
	}

	override async executeInteraction(interaction: ChatInputCommandInteraction) {
		const target = interaction.options.getUser("target", true);

		if (!target) {
			return interaction.reply({
				content: `That is not a valid user.`
			});
		}

		return interaction.reply({
			content: `${target}, you have a greeting from ${interaction.user}!`,
			...options
		});
	}
}
