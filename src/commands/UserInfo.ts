import {
	ApplicationCommandData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	GuildMember,
	InteractionContextType,
	InteractionEditReplyOptions,
	MessageFlags,
	time,
	User
} from "discord.js";

import Command, { CommandCategory } from "@structures/Command.js";

export default class UserInfo extends Command {
	constructor() {
		super({
			name: "user",
			category: CommandCategory.Utility,
			description: "Get information about a user."
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
					name: "info",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Get information about a user.",
					options: [
						{
							name: "target",
							description: "The target user.",
							type: ApplicationCommandOptionType.User,
							required: false
						}
					]
				}
			]
		};
	}

	async execute(interaction: ChatInputCommandInteraction) {
		const rawTarget = interaction.options.getUser("target", false) ?? interaction.user;

		const target = await rawTarget.fetch(true);
		const targetMember = interaction.inCachedGuild()
			? await interaction.guild.members.fetch(target.id).catch(() => null)
			: null;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		return interaction.editReply(await UserInfo._getInfo({ target, targetMember }));
	}

	/**
	 * Get information about a user.
	 */

	static async _getInfo(data: {
		target: User;
		targetMember: GuildMember | null;
	}): Promise<InteractionEditReplyOptions> {
		const { target, targetMember } = data;

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${target.displayName} (@${target.username})`,
				iconURL: target.displayAvatarURL({ size: 4096 }),
				url: target.displayAvatarURL({ size: 4096 })
			})
			.setColor(Colors.NotQuiteBlack)
			.setFields([
				{
					name: "Account Created",
					value: time(target.createdAt, "R"),
					inline: true
				},
				{
					name: "Account URLs",
					value: `[Global Avatar](${target.displayAvatarURL()})${targetMember ? `\n[Guild Avatar](${targetMember.displayAvatarURL()})` : ""}${target.banner ? `\n[Banner](${target.bannerURL()})` : ""}`,
					inline: true
				}
			])
			.setThumbnail(target.displayAvatarURL())
			.setFooter({ text: `User ID: ${target.id}` });

		if (target.flags) {
			const flags = target.flags.toArray();

			if (flags.length) {
				embed.addFields({
					name: "Account Flags",
					value: target.flags.toArray().join(", "),
					inline: true
				});
			}
		}

		return {
			embeds: [embed]
		};
	}
}
