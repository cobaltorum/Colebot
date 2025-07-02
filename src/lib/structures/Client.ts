import { Client, GatewayIntentBits, Options, Sweepers } from "discord.js";

export default class CustomClient extends Client<true> {
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
	}
}
