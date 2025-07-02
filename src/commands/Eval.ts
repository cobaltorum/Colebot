import {
	ActionRowBuilder,
	ApplicationCommandData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	codeBlock,
	InteractionContextType,
	MessageFlags
} from "discord.js";

import ms from "ms";
import util from "util";

import { generateSnowflake, hastebin } from "@utils/index.js";
import { lmdb } from "@/index.js";

import Command, { CommandCategory } from "@structures/Command.js";

export default class Eval extends Command {
	constructor() {
		super({
			name: "eval",
			category: CommandCategory.Developer,
			description: "Evaluate JavaScript code."
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
					name: "code",
					description: "The code to evaluate.",
					type: ApplicationCommandOptionType.String,
					required: true
				},
				{
					name: "async",
					description: "Whether the evaluation should be asynchronous.",
					type: ApplicationCommandOptionType.Boolean,
					required: false
				},
				{
					name: "depth",
					description: "The depth used when inspecting the evaluation.",
					type: ApplicationCommandOptionType.Integer,
					required: false,
					minValue: 1
				}
			]
		};
	}

	override async executeInteraction(interaction: ChatInputCommandInteraction) {
		if (process.env.DEVELOPER_ID !== interaction.user.id) {
			return interaction.reply({
				content: `Only the bot's maintainer can use this command.`
			});
		}

		const code = interaction.options.getString("code", true);
		const isAsync = interaction.options.getBoolean("async", false) ?? false;
		const depth = interaction.options.getInteger("depth", false) ?? 0;

		let rawOutput;
		let error: boolean = false;

		const start = performance.now();
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			rawOutput = await eval(isAsync ? `(async () => { ${code} })()` : code);
		} catch (_) {
			rawOutput = _;
			error = true;
		}

		const timeTaken = performance.now() - start;
		const type = typeof rawOutput;

		const output = typeof rawOutput === "string" ? rawOutput : util.inspect(rawOutput, { depth });
		const id = generateSnowflake();

		await lmdb.put(`eval:${id}`, output);

		const content = error
			? `**Error**\n${codeBlock("js", output)}\n**Time Taken:** \`${Eval._formatTime(timeTaken)}\``
			: `**Output**\n${codeBlock(
					"ts",
					output
				)}\n**Return Type:** \`${type}\`\n**Time Taken:** \`${Eval._formatTime(timeTaken)}\``;

		if (output.length > 1900) {
			const dataUrl = await hastebin(output, "js");
			const buttons: ButtonBuilder[] = [];

			if (dataUrl) {
				const viewButton = new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setLabel("Open In Browser")
					.setURL(dataUrl);

				buttons.push(viewButton);
			}

			const downloadButton = new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel("Download")
				.setCustomId(`download-eval-output-${id}`);

			const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons, downloadButton);

			return interaction.editReply({
				content: `**Return Type:** \`${error ? `error` : type}\`\n**Time Taken:** \`${Eval._formatTime(
					timeTaken
				)}\``,
				components: [actionRow]
			});
		}

		const button = new ButtonBuilder()
			.setStyle(ButtonStyle.Secondary)
			.setLabel("Download")
			.setCustomId(`download-eval-output-${id}`);

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

		return interaction.editReply({ content, components: [actionRow] });
	}

	private static _formatTime(timeTaken: number): string {
		return timeTaken < 1
			? `${Math.round(timeTaken / 1e-2)} microseconds`
			: ms(Math.round(timeTaken), { long: true });
	}
}
