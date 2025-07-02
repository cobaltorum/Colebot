import {
	ApplicationCommandData,
	ApplicationCommandType,
	MessageFlags,
	UserContextMenuCommandInteraction
} from "discord.js";

import Command, { CommandCategory } from "@structures/Command.js";
import UserInfo from "./UserInfo.js";

export default class UserInfoCtx extends Command {
	constructor() {
		super({
			name: "User Info",
			category: CommandCategory.Utility,
			description: `Get information about a user.`
		});
	}

	registerAppCommand(): ApplicationCommandData {
		return {
			name: this.name,
			type: ApplicationCommandType.User
		};
	}

	async execute(interaction: UserContextMenuCommandInteraction) {
		const target = await interaction.targetUser.fetch();
		const targetMember = interaction.inCachedGuild()
			? await interaction.guild.members.fetch(target.id).catch(() => null)
			: null;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		return interaction.editReply(await UserInfo._getInfo({ target, targetMember }));
	}
}
