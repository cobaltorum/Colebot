import { SnowflakeUtil } from "discord.js";

/**
 * Pluralizes a word based on the given count
 *
 * @param count The count used to determine the plural form
 * @param singular The singular form of the word
 * @param plural The plural form of the word, defaults to `{singular}s`
 *
 * @returns The pluralized word
 */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
	return count === 1 ? singular : plural;
}

/**
 * Wait a certain amount of time before proceeding with the next step
 *
 * @param ms The amount of time to wait in milliseconds
 * @returns A promise that resolves after the specified time has elapsed
 */

export async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Uploads data to hastebin and returns the URL of the document.
 *
 * @param data The data to upload
 * @param ext The extension of the file (default .js)
 * @returns The url of the document
 */

export async function hastebin(data: any, ext: string = "js"): Promise<string | null> {
	const binReq = await fetch("https://hst.sh/documents", {
		method: "POST",
		body: typeof data === "object" ? JSON.stringify(data, null, 2) : data
	});

	if (!binReq.ok) return null;

	const bin = (await binReq.json()) as { key: string };
	return `https://hst.sh/${bin.key}.${ext}`;
}

/**
 * Generate a discord Snowflake ID based on the current time.
 * @returns The generated snowflake ID.
 */

export function generateSnowflake(): string {
	return String(SnowflakeUtil.generate({ timestamp: new Date().getTime() }));
}
