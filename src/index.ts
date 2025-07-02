import "dotenv/config.js";

import { sleep } from "@utils/index.js";

import Logger from "@utils/Logger.js";
import CustomClient from "@structures/Client.js";
import CommandManager from "@managers/client/CommandManager.js";
import ComponentManager from "@managers/client/ComponentManager.js";
import EventListenerManager from "@managers/client/EventListenerManager.js";

/**
 * The main client instance.
 */
export const client = new CustomClient();

async function main(): Promise<void> {
	/**
	 * Checks if the required environment variables are set.
	 * If any of them are missing, an error will be thrown, and the bot will not start.
	 */

	if (!process.env.BOT_TOKEN) {
		throw new Error("Missing BOT_TOKEN environment variable.");
	}

	if (!process.env.BOT_ID) {
		throw new Error("Missing BOT_ID environment variable.");
	}

	if (!process.env.DEFAULT_PREFIX) {
		throw new Error("Missing DEFAULT_PREFIX environment variable.");
	}

	if (!process.env.DEVELOPER_ID) {
		throw new Error("Missing DEVELOPER_ID environment variable.");
	}

	// Cache all commands.
	await CommandManager.cache();

	// Cache all components.
	await ComponentManager.cache();

	// Mount all event listeners.
	await EventListenerManager.mount();

	// Login to Discord.
	await client.login(process.env.BOT_TOKEN);

	// Wait 2 seconds then publish all commands.
	await sleep(2000);
	await CommandManager.publish();
}

if (process.env.NODE_ENV !== "test") {
	try {
		void main();
	} catch (error) {
		Logger.error(error);
		process.exit(1);
	}

	process.on("unhandledRejection", error => {
		Logger.error(`Unhandled Rejection:`, error);
	});

	process.on("uncaughtException", error => {
		Logger.error(`Uncaught Exception:`, error);
	});
}
