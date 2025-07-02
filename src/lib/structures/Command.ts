import { ApplicationCommandData, Awaitable, CommandInteraction } from "discord.js";

import { client } from "@/index.js";

export default abstract class Command {
	/**
	 * The client that owns this command.
	 */

	public client = client;

	/**
	 * The name of the command.
	 */

	public readonly name: string;

	/**
	 * The aliases of the command.
	 * These are alternative names that can be used to invoke the command.
	 */

	public readonly aliases: string[];

	/**
	 * The category of the command.
	 * Useful for documentation and help commands, but required for all commands.
	 */

	public readonly category: keyof typeof CommandCategory;

	/**
	 * The description of the command.
	 * Useful for documentation and help commands.
	 */

	public readonly description: string;

	/**
	 * The application command data for the command.
	 * This is used to register the command with Discord.
	 */

	public data: ApplicationCommandData | null;

	/**
	 * Constructs a new command.
	 *
	 * @param options The options for the command.
	 */

	public constructor(options: CommandOptions) {
		const { name, aliases, description, category } = options;

		this.name = name;
		this.aliases = aliases ?? [];
		this.category = category;
		this.description = description ?? null;

		// Initially set to null.
		this.data = null;
	}

	/**
	 * Handler used to register the command as an application command.
	 * This method must return an object containing {@link ApplicationCommandData}.
	 */

	abstract registerAppCommand(): ApplicationCommandData;

	/**
	 * Handler that is called when the command is executed as an application command.
	 *
	 * @param interaction The interaction that triggered the command.
	 */

	abstract execute(interaction: CommandInteraction): Awaitable<unknown>;
}

/**
 * The category a command belongs to.
 * You'll need to extend this to add your own categories.
 *
 * @example
 * ```ts
 * export const CommandCategory = {
 *      Utility: "Utility",
 *      General: "General",
 * 		Developer: "Developer",
 * 		Fun: "Fun"
 * } as const;
 * export type CommandCategory = (typeof CommandCategory)[keyof typeof CommandCategory];
 * ```
 */

export const CommandCategory = {
	Utility: "Utility",
	General: "General",
	Developer: "Developer"
} as const;
export type CommandCategory = (typeof CommandCategory)[keyof typeof CommandCategory];

/**
 * The options for a command.
 * This extends the {@link ApplicationCommandData} type provided by Discord.js.
 */

export type CommandOptions = {
	/**
	 * The name of the command.
	 */

	name: string;

	/**
	 * The aliases of the command.
	 * These are alternative names that can be used to invoke the command.
	 */

	aliases?: string[];

	/**
	 * The description of the command.
	 * This is useful for a help command.
	 */

	description: string;

	/**
	 * The category of the command.
	 * Useful for documentation and help commands, but required for all commands.
	 */
	category: keyof typeof CommandCategory;
};
