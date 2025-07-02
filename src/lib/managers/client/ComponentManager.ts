import { readdirSync, existsSync } from "fs";
import { Collection } from "discord.js";
import { resolve } from "path";

import { pluralize } from "@utils/index.js";

import Component, { CustomID } from "@structures/Component.js";
import Logger from "@utils/Logger.js";

export default class ComponentManager {
	/**
	 * The cached components.
	 */
	static #cache = new Collection<CustomID, Component>();

	/**
	 * Caches all components from the components directory.
	 */

	static async cache(): Promise<void> {
		const dirpath = resolve("src/components");

		if (!existsSync(dirpath)) {
			Logger.error("Components directory not found.");
			process.exit(1);
		}

		Logger.info("Caching components...");

		let count = 0;

		try {
			const filenames = readdirSync(dirpath);

			for (const filename of filenames) {
				const parsed = filename.replaceAll(".ts", ".js");
				const componentClass = (await import(`../../../components/${parsed}`)).default;
				const component = new componentClass();

				if (!(component instanceof Component)) {
					continue;
				}

				ComponentManager.#cache.set(component.id, component);
				Logger.custom("COMPONENTS", `Cached "${ComponentManager._parseCustomId(component.id)}".`, {
					color: "Purple"
				});
				count++;
			}
		} catch (error) {
			Logger.error("An error occurred while caching components:", error);
			process.exit(1);
		} finally {
			Logger.info(`Cached ${count} ${pluralize(count, "component")}.`);
		}
	}

	/**
	 * Retrieves a component by its custom ID.
	 *
	 * @param customId The custom ID of the component to retrieve.
	 * @return The component associated with the custom ID, or undefined if not found.
	 */

	static get(customId: string): Component | undefined {
		return ComponentManager.#cache.find(component => {
			if (typeof component.id === "string") {
				return component.id === customId;
			}

			if ("matches" in component.id) {
				return customId.match(component.id.matches);
			}

			if ("startsWith" in component.id) {
				return customId.startsWith(component.id.startsWith);
			}

			if ("endsWith" in component.id) {
				return customId.endsWith(component.id.endsWith);
			}

			return customId.includes(component.id.includes);
		});
	}

	/**
	 * Parses a string/object custom ID to a string.
	 *
	 * @param customId The custom ID to parse.
	 * @returns The parsed custom ID as a string.
	 */
	private static _parseCustomId(customId: CustomID): string {
		if (typeof customId === "string") {
			return customId;
		}

		switch (true) {
			case "matches" in customId:
				return `matches(${customId.matches.toString()})`;
			case "startsWith" in customId:
				return `startsWith(${customId.startsWith})`;
			case "endsWith" in customId:
				return `endsWith(${customId.endsWith})`;
			case "includes" in customId:
				return `includes(${customId.includes})`;
			default:
				return "unknown";
		}
	}
}
