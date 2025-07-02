import { AttachmentBuilder, ButtonInteraction, MessageFlags } from "discord.js";
import { lmdb } from "@/index.js";

import Component from "@structures/Component.js";

export default class DownloadEvalOutput extends Component {
	constructor() {
		super({ matches: /^download-eval-output-\d{17,19}$/m });
	}

	async execute(interaction: ButtonInteraction) {
		const id = interaction.customId.split("-")[3];
		const output = lmdb.get(id);

		if (!output) {
			return interaction.reply({
				content: `Evaluation output not found.`,
				flags: MessageFlags.Ephemeral
			});
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const buffer = Buffer.from(output, "utf-8");
		const attachment = new AttachmentBuilder(buffer, { name: `eval-${id}.txt` });

		return interaction.editReply({
			files: [attachment]
		});
	}
}
