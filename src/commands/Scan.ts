import {
	ActionRowBuilder,
	ApplicationCommandData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	inlineCode,
	InteractionContextType,
	MessageFlags
} from "discord.js";

import Command, { CommandCategory } from "@structures/Command.js";

const VirustotalApiEndpoint = "https://www.virustotal.com/api/v3/urls/";

export default class Scan extends Command {
	constructor() {
		super({
			name: "scan-url",
			category: CommandCategory.Utility,
			description: "Scan a URL through virus total."
		});
	}

	override registerAppCommand(): ApplicationCommandData {
		return {
			name: this.name,
			type: ApplicationCommandType.ChatInput,
			description: this.description,
			integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
			contexts: [
				InteractionContextType.PrivateChannel,
				InteractionContextType.BotDM,
				InteractionContextType.Guild
			],
			options: [
				{
					name: "url",
					description: "The URL to scan.",
					type: ApplicationCommandOptionType.String,
					required: true
				}
			]
		};
	}

	async execute(interaction: ChatInputCommandInteraction) {
		const apiKey = process.env.VIRUSTOTAL_API_KEY;

		if (!apiKey) {
			return interaction.reply({
				content: "This command requires the VIRUSTOTAL_API_KEY environment variable."
			});
		}

		let url = interaction.options.getString("url", true);

		// Normalize URL to https://
		if (url.startsWith("http://")) {
			url = "https://" + url.slice(7);
		} else if (!url.startsWith("https://")) {
			url = `https://${url}`;
		}

		// Base64 encode the URL and remove padding.
		let encodedUrl = Buffer.from(url).toString("base64").replace(/=+$/, "");
		const apiUrl = `${VirustotalApiEndpoint}${encodedUrl}`;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let result: UrlScanResponse | null = null;

		try {
			const res = await fetch(apiUrl, {
				method: "GET",
				headers: {
					"X-Apikey": apiKey,
					"Content-Type": "application/json",
					Accept: "application/json"
				}
			});

			if (!res.ok) {
				const status = inlineCode(`${res.status} ${res.statusText}`);

				return interaction.editReply({
					content: `An error occurred while attempting to communicate with the virustotal API: ${status}`
				});
			}

			result = (await res.json()) as UrlScanResponse;
		} catch {
			return interaction.editReply({
				content: "An error occurred while attempting to parse the scan data."
			});
		}

		const { attributes: data, id } = result.data;

		const trackers = Object.keys(data.trackers ?? {});
		const stats = data.last_analysis_stats;

		const embed = new EmbedBuilder()
			.setFields([
				{ name: "URL", value: inlineCode(data.url), inline: true },
				{ name: "Final URL", value: inlineCode(data.last_final_url), inline: true },
				{ name: "Tags", value: inlineCode(data.tags.join("`, `") || "None"), inline: true },
				{ name: "Trackers", value: inlineCode(trackers.join("`, `") || "None"), inline: true }
			])
			.setFooter({ text: "Results may be inaccurate." });

		if (stats.malicious > 0) {
			embed.setColor("#FF5A50").setTitle("❗ Malicious");
		} else if (stats.suspicious > 0) {
			embed.setColor("#FFED2E").setTitle("⚠️ Suspicious");
		} else {
			embed.setColor("#27C6A3").setTitle("✅ Harmless");
		}

		if (stats.malicious > 0 || stats.suspicious > 0) {
			const malicious: string[] = [];
			const suspicious: string[] = [];

			for (const [engine, { category }] of Object.entries(data.last_analysis_results)) {
				if (category === "malicious") malicious.push(engine);
				else if (category === "suspicious") suspicious.push(engine);
			}

			if (malicious.length) {
				embed.addFields({
					name: "Flagged as Malicious By",
					value: malicious.map(inlineCode).join(", "),
					inline: true
				});
			}

			if (suspicious.length) {
				embed.addFields({
					name: "Flagged as Suspicious By",
					value: suspicious.map(inlineCode).join(", "),
					inline: true
				});
			}
		}

		const onlineReportUrl = `https://virustotal.com/gui/url/${id}`;
		const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder().setLabel("View Full Report").setStyle(ButtonStyle.Link).setURL(onlineReportUrl)
		);

		return interaction.editReply({
			embeds: [embed],
			components: [actionRow]
		});
	}
}

type UrlScanResponse = {
	data: {
		id: string;
		attributes: {
			url: string;
			last_final_url: string;
			tags: string[];
			last_analysis_stats: {
				harmless: number;
				malicious: number;
				suspicious: number;
				timeout: number;
				failure: number;
			};
			trackers?: {
				[tracker: string]: string[];
			};
			last_analysis_results: {
				[engine: string]: {
					category: string;
				};
			};
		};
	};
};
