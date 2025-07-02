import "dotenv/config.js";

import { sleep } from "@utils/index.js";
import { open } from "lmdb";
import { join } from "path";

import Logger from "@utils/Logger.js";
import ColebotClient from "@structures/Client.js";

/**
 * The main client instance.
 */
export const client = new ColebotClient();

/**
 * The main LMDB database client instance.
 */

export const lmdb = open<string, string>(join(process.cwd(), "data"), {
	compression: true,
	encoding: "string"
});

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

	if (!process.env.DEVELOPER_ID) {
		throw new Error("Missing DEVELOPER_ID environment variable.");
	}

	// Load all modules.
	await client.loadModules();

	// Login to Discord.
	await client.login(process.env.BOT_TOKEN);

	// Wait 2 seconds then publish all commands.
	await sleep(2000);
	await client.publish();
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
