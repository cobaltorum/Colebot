import { readdirSync, existsSync } from "fs";
import { resolve } from "path";

import { pluralize } from "@utils/index.js";
import { client } from "@/index.js";

import EventListener from "@structures/EventListener.js";
import Logger from "@utils/Logger.js";

export default class EventListenerManager {
	/**
	 * Mounts all event listeners to the client.
	 */

	public static async mount(): Promise<void> {
		const dirpath = resolve("src/events");

		if (!existsSync(dirpath)) {
			Logger.error("Events directory not found.");
			process.exit(1);
		}

		Logger.info("Mounting event listeners...");

		let count = 0;

		try {
			const filenames = readdirSync(dirpath);

			for (const filename of filenames) {
				const parsed = filename.replaceAll(".ts", ".js");
				const listenerClass = (await import(`../../../events/${parsed}`)).default;
				const listener = new listenerClass();

				if (!(listener instanceof EventListener)) {
					continue;
				}

				const logMessage = `Mounted event listener "${listener.event}"`;

				if (listener.once) {
					client.once(listener.event, (...args: unknown[]) => listener.execute(...args));
					Logger.custom("ONCE", logMessage, { color: "Purple" });
				} else {
					client.on(listener.event, (...args: unknown[]) => listener.execute(...args));
					Logger.custom("ON", logMessage, { color: "Purple" });
				}

				count++;
			}
		} catch (error) {
			Logger.error("An error occurred while mounting event listeners:", error);
			process.exit(1);
		} finally {
			Logger.info(`Mounted ${count} ${pluralize(count, "event listener")}.`);
		}
	}
}
