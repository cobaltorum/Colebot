import { ApplicationCommandData, Collection } from "discord.js";
import { resolve } from "node:path";
import { readdirSync, existsSync } from "node:fs";

import { pluralize } from "@utils/index.js";
import { client } from "@/index.js";

import Logger from "@utils/Logger.js";
import Command from "@structures/Command.js";

export default class CommandManager {
	/**
	 * The cached commands.
	 */

	static #cache = new Collection<string, Command>();

	/**
	 * Caches all commands from the commands directory.
	 */

	static async cache(): Promise<void> {
		const dirpath = resolve("src/commands");

		if (!existsSync(dirpath)) {
			Logger.error("Commands directory not found.");
			process.exit(1);
		}

		Logger.info("Caching commands...");

		let count = 0;

		try {
			const filenames = readdirSync(dirpath);

			for (const filename of filenames) {
				const parsed = filename.replaceAll(".ts", ".js");
				const commandClass = (await import(`../../../commands/${parsed}`)).default;
				const command = new commandClass();

				if (!(command instanceof Command)) {
					Logger.error(`Default export from ${parsed} is not an instance of Command class.`);
					continue;
				}

				if (typeof command.registerAppCommand === "function") {
					command.data = command.registerAppCommand();
				}

				CommandManager.#cache.set(command.name, command);
				Logger.custom("COMMANDS", `Cached "${command.name}".`, { color: "Purple" });
				count++;
			}
		} catch (error) {
			Logger.error("An error occurred while caching commands:", error);
			process.exit(1);
		} finally {
			Logger.info(`Cached ${count} ${pluralize(count, "command")}.`);
		}
	}

	/**
	 * Retrieves an application command by its name or alias.
	 *
	 * @param name The name or alias.
	 * @returns The command if found, otherwise undefined.
	 */

	static get(name: string): Command | undefined {
		return CommandManager.#cache.find(command => command.name === name || command.aliases.includes(name));
	}

	/**
	 * Publishes all cached commands to the Discord API.
	 */

	static async publish(): Promise<void> {
		const commands: ApplicationCommandData[] = [];

		CommandManager.#cache.forEach(command => {
			if (command.data) commands.push(command.data);
		});

		if (!commands.length) {
			Logger.warn("Found no commands to publish.");
			return;
		}

		try {
			await client.application.commands.set(commands);
		} catch (error) {
			Logger.error("An error occurred while publishing commands:", error);
			process.exit(1);
		} finally {
			Logger.custom("GLOBAL", `Published ${commands.length} ${pluralize(commands.length, "command")}.`, {
				color: "Purple",
				full: true
			});
		}
	}
}
