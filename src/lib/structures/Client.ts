import { ApplicationCommandData, Client, Collection, GatewayIntentBits, Options, Sweepers } from "discord.js";
import { existsSync, readdirSync } from "fs";
import { resolve } from "path";

import { pluralize } from "@utils/index.js";

import Logger from "@utils/Logger.js";
import Command from "./Command.js";
import Component, { CustomID } from "./Component.js";
import EventListener from "./EventListener.js";

export default class ColebotClient extends Client<true> {
	/**
	 * The command & component modules.
	 */

	private modules: {
		commands: Collection<string, Command>;
		components: Collection<CustomID, Component>;
	};

	constructor() {
		super({
			/**
			 * Gateway intents (bits).
			 * The following privileged intents are required for the bot to work:
			 *
			 * 1. Server Members Intent
			 * 2. Message Content Intent
			 *
			 * If these intents have not been granted the client will not log in.
			 * @see https://discord.com/developers/docs/topics/gateway#gateway-intents
			 */
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent
			],

			/**
			 * Cache options for the client. Properties:
			 *
			 * Users - Cached with a limit of 1000.
			 * Members - Cached infinitely (depending on how many guilds your bot is on this may cause significant memory usage),
			 * Application commands - Cached infinitely.
			 *
			 * The rest of the cache options are set to 0, meaning they will not be cached.
			 * You might want to adjust these based on your bot's needs.
			 */

			makeCache: Options.cacheWithLimits({
				/**
				 * Guild Managers
				 */
				BaseGuildEmojiManager: 0, // Guild emojis
				GuildBanManager: 0, // Guild bans
				GuildEmojiManager: 0, // Guild emojis
				GuildStickerManager: 0, // Guild stickers
				GuildMemberManager: Infinity, // Guild members
				GuildTextThreadManager: 0, // Guild text threads
				GuildForumThreadManager: 0, // Guild forum threads
				GuildInviteManager: 0, // Guild invites
				GuildScheduledEventManager: 0, // Guild scheduled events
				PresenceManager: 0, // Guild presences
				GuildMessageManager: 0, // Channel messages
				AutoModerationRuleManager: 0, // Guild auto moderation rules,

				/**
				 * Channel Managers etc.
				 */
				ThreadMemberManager: 0, // Thread members
				VoiceStateManager: 0, // Guild voice states,
				StageInstanceManager: 0, // Guild stage instances
				ThreadManager: 0, // Guild threads
				ReactionManager: 0, // Guild reactions
				ReactionUserManager: 0, // Guild user reactions
				MessageManager: 0, // Channel messages

				/**
				 * Client Managers
				 */
				UserManager: 1000, // Users
				ApplicationCommandManager: Infinity // Application commands
			}),

			/**
			 * The sweeper options for the client.
			 *
			 * Guild members are sweeped every 30 minutes and must be older than 1 hour.
			 * Users are sweeped every hour and must be older than 10 minutes.
			 *
			 * The bot is excluded from the guild member sweeper.
			 */
			sweepers: {
				...Options.DefaultSweeperSettings,
				guildMembers: {
					interval: 1800,
					filter: Sweepers.filterByLifetime({
						lifetime: 1800,
						excludeFromSweep: member => member.id !== process.env.BOT_ID!
					})
				},
				users: {
					interval: 1800,
					filter: Sweepers.filterByLifetime({
						lifetime: 600,
						excludeFromSweep: user => user.id === process.env.BOT_ID!
					})
				}
			},

			/**
			 * The client does not parse any mentions by default.
			 */

			allowedMentions: { parse: [] }
		});

		/** Create modules object. */
		this.modules = {
			commands: new Collection<string, Command>(),
			components: new Collection<string, Component>()
		};
	}

	/**
	 * Retrieves an application command by its name or alias.
	 *
	 * @param name The name or alias.
	 * @returns The command if found, otherwise undefined.
	 */

	getCommand(name: string): Command | undefined {
		return this.modules.commands.find(command => command.name === name);
	}

	/**
	 * Retrieves a component by its custom ID.
	 *
	 * @param customId The custom ID of the component to retrieve.
	 * @return The component associated with the custom ID, or undefined if not found.
	 */

	getComponent(customId: string): Component | undefined {
		return this.modules.components.find(component => {
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
	 * Publish the loaded commands to the Discord API.
	 */

	async publish(): Promise<void> {
		const commands: ApplicationCommandData[] = [];

		this.modules.commands.forEach(command => {
			if (command.data) commands.push(command.data);
		});

		if (!commands.length) {
			Logger.warn("Found no commands to publish.");
			return;
		}

		try {
			await this.application.commands.set(commands);
		} catch (error) {
			Logger.error("An error occurred while publishing commands:", error);
			process.exit(1);
		} finally {
			Logger.custom("CLIENT", `Published ${commands.length} ${pluralize(commands.length, "command")}.`, {
				color: "Purple",
				full: true
			});
		}
	}

	/**
	 * Load all modules the bot relies on.
	 * The modules will be loaded in the following order:
	 *
	 * 1. Commands
	 * 2. Components
	 * 3. Events
	 */

	async loadModules(): Promise<void> {
		await this._loadCommands();
		await this._loadComponents();
		await this._loadEvents();
	}

	/**
	 * Load all commands from the `commands` directory.
	 */

	private async _loadCommands(): Promise<void> {
		const dirpath = resolve("src/commands");

		if (!existsSync(dirpath)) {
			Logger.error("Commands directory not found.");
			process.exit(1);
		}

		Logger.info("Loading commands...");

		let count = 0;

		try {
			const filenames = readdirSync(dirpath);

			for (const filename of filenames) {
				const parsed = filename.replaceAll(".ts", ".js");
				const commandClass = (await import(`../../commands/${parsed}`)).default;
				const command = new commandClass();

				if (!(command instanceof Command)) {
					Logger.error(`Default export from ${parsed} is not an instance of Command class.`);
					continue;
				}

				if (typeof command.registerAppCommand === "function") {
					command.data = command.registerAppCommand();
				}

				this.modules.commands.set(command.name, command);
				Logger.custom("COMMANDS", `Loaded "${command.name}".`, { color: "Purple" });
				count++;
			}
		} catch (error) {
			Logger.error("An error occurred while loading commands:", error);
			process.exit(1);
		} finally {
			Logger.info(`Loaded ${count} ${pluralize(count, "command")}.`);
		}
	}

	/**
	 * Load all components from the `components` directory.
	 */

	private async _loadComponents(): Promise<void> {
		const dirpath = resolve("src/components");

		if (!existsSync(dirpath)) {
			Logger.error("Components directory not found.");
			process.exit(1);
		}

		Logger.info("Loading components...");

		let count = 0;

		try {
			const filenames = readdirSync(dirpath);

			for (const filename of filenames) {
				const parsed = filename.replaceAll(".ts", ".js");
				const componentClass = (await import(`../../components/${parsed}`)).default;
				const component = new componentClass();

				if (!(component instanceof Component)) {
					continue;
				}

				this.modules.components.set(component.id, component);
				Logger.custom("COMPONENTS", `Loaded "${ColebotClient._parseCustomId(component.id)}".`, {
					color: "Purple"
				});
				count++;
			}
		} catch (error) {
			Logger.error("An error occurred while loading components:", error);
			process.exit(1);
		} finally {
			Logger.info(`Loaded ${count} ${pluralize(count, "component")}.`);
		}
	}

	/**
	 * Mount all event listeners from the `events` directory to the client.
	 */

	private async _loadEvents(): Promise<void> {
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
				const listenerClass = (await import(`../../events/${parsed}`)).default;
				const listener = new listenerClass();

				if (!(listener instanceof EventListener)) {
					continue;
				}

				const logMessage = `Mounted event listener "${listener.event}"`;

				if (listener.once) {
					this.once(listener.event, (...args: unknown[]) => listener.execute(...args));
					Logger.custom("ONCE", logMessage, { color: "Purple" });
				} else {
					this.on(listener.event, (...args: unknown[]) => listener.execute(...args));
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
