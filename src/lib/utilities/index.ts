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

/**
 * Converts a duration in milliseconds to a human-readable string.
 *
 * - Uses days, hours, and minutes as units.
 * - Formats as "{count} {unit}" (e.g., "5 minutes").
 * - Returns "< 1 minute" if the duration is less than one minute.
 *
 * @param ms The duration in milliseconds to format.
 * @returns A human-readable string representing the duration (e.g., 300000 = "5 minutes").
 */
export function formatTime(ms: number): string {
	const day = 86400000,
		hour = 3600000,
		minute = 60000;

	let d = (ms / day) | 0,
		h = ((ms % day) / hour) | 0,
		m = ((ms % hour) / minute) | 0;

	if (d)
		return `${d} ${pluralize(d, "day")}${h ? " " + h + " " + pluralize(h, "hour") : ""}${m ? " " + m + " " + pluralize(m, "minute") : ""}`;
	if (h) return `${h} ${pluralize(h, "hour")}${m ? " " + m + " " + pluralize(m, "minute") : ""}`;
	if (m) return `${m} ${pluralize(m, "minute")}`;

	return "< 1 minute";
}
