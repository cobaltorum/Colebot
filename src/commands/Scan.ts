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

	registerAppCommand(): ApplicationCommandData {
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
		const key = process.env.VIRUSTOTAL_API_KEY;

		if (!key) {
			return interaction.reply({
				content: "This command requires the VIRUSTOTAL_API_KEY environment variable."
			});
		}

		const parsedUrl = Scan._parseURL(interaction.options.getString("url", true));

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let result: UrlScanResponse | null = null;

		try {
			const res = await fetch(`${VirustotalApiEndpoint}${parsedUrl}`, {
				method: "GET",
				headers: {
					"X-Apikey": key,
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

		const rawTrackers = Object.keys(data.trackers ?? {});
		const stats = data.last_analysis_stats;

		const status =
			stats.malicious > 0
				? `❗**Malicious URL**❗`
				: stats.suspicious
					? `⚠️**Suspicious URL**⚠️`
					: `👌**Harmless URL**👌`;

		const contentArray: string[] = [
			`URL: ${data.url}`,
			`Final URL: ${data.last_final_url}`,
			"------------------------",
			`Tags: ${data.tags.join(", ") || "None"}`,
			`Trackers: ${rawTrackers.join(", ") || "None"}`
		];

		if (stats.malicious > 0 || stats.suspicious > 0) {
			const malicious: string[] = [];
			const suspicious: string[] = [];

			for (const [engine, { category }] of Object.entries(data.last_analysis_results)) {
				if (category === "malicious") malicious.push(engine);
				else if (category === "suspicious") suspicious.push(engine);
			}

			contentArray.push("------------------------");
			contentArray.push(`Flagged as malicious by: ${malicious.join(", ") || "None"}`);
			contentArray.push(`Flagged as suspicious by: ${suspicious.join(", ") || "None"}`);
		}

		const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setLabel("View Full Report")
				.setStyle(ButtonStyle.Link)
				.setURL(`https://virustotal.com/gui/url/${id}`)
		);

		const content = `${status}${codeBlock(contentArray.join("\n"))}\n-# These results may be inaccurate. Always be careful when opening links.`;

		return interaction.editReply({
			content,
			components: [actionRow]
		});
	}

	/**
	 * Parse the retrieved URL and make it compatible.
	 *
	 * @param url The raw URL.
	 * @returns The parsed URL.
	 */

	private static _parseURL(url: string): string {
		// Normalize URL to https://
		if (url.startsWith("http://")) {
			url = "https://" + url.slice(7);
		} else if (!url.startsWith("https://")) {
			url = `https://${url}`;
		}

		// Base64 encode the URL and remove padding.
		return Buffer.from(url).toString("base64").replace(/=+$/, "");
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
