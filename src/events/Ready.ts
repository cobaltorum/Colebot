import { Events } from "discord.js";

import Logger from "@utils/Logger.js";
import EventListener from "@structures/EventListener.js";

export default class Ready extends EventListener {
	constructor() {
		super(Events.ClientReady, true);
	}

	async execute() {
		return Logger.success(`Successfully logged in as ${this.client.user.tag}!`);
	}
}
