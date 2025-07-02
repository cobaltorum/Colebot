import { SnowflakeRegex, UserOrMemberMentionRegex } from "@sapphire/discord-utilities";
import {
	CategoryChannel,
	DMChannel,
	GuildBasedChannel,
	GuildMember,
	GuildTextBasedChannelTypes,
	Message,
	NewsChannel,
	PartialGroupDMChannel,
	PrivateThreadChannel,
	PublicThreadChannel,
	Snowflake,
	StageChannel,
	TextChannel,
	ThreadChannel,
	User,
	VoiceBasedChannel,
	VoiceChannel
} from "discord.js";
import { ArgumentStream, join, WordParameter } from "@sapphire/lexure";
import { Result } from "@sapphire/result";

import {
	isCategoryChannel,
	isDMChannel,
	isGroupChannel,
	isGuildBasedChannel,
	isNewsChannel,
	isNewsThreadChannel,
	isPrivateThreadChannel,
	isPublicThreadChannel,
	isStageChannel,
	isTextBasedChannel,
	isTextChannel,
	isThreadChannel,
	isVoiceBasedChannel,
	isVoiceChannel,
	TextBasedChannelTypes
} from "@sapphire/discord.js-utilities";

export class Args {
	/**
	 * The message that triggered the parser.
	 */

	private message: Message<true>;

	/**
	 * Internal argument parser.
	 */

	private parser: ArgumentStream;

	/**
	 * Constructs a new Args instance.
	 *
	 * @param message The message that triggered the parser.
	 * @param parser The argument parser to use for this class.
	 */

	public constructor(message: Message<true>, parser: ArgumentStream) {
		this.message = message;
		this.parser = parser;
	}

	/**
	 * Whether all the arguments have been consumed.
	 */

	public get finished(): boolean {
		return this.parser?.finished ?? true;
	}

	/**
	 * Retrieves a member from the available arguments.
	 */

	public async getMember(): Promise<GuildMember | null> {
		if (this.parser.finished) {
			return null;
		}

		return this.parser
			.singleParseAsync<GuildMember | null, null>(async parameter => {
				const memberId = UserOrMemberMentionRegex.exec(parameter) ?? SnowflakeRegex.exec(parameter);
				const member = memberId
					? await this.message.guild.members.fetch(memberId[1] as Snowflake).catch(() => null)
					: null;

				return Result.ok(member);
			})
			.then(result => result.unwrap());
	}

	/**
	 * Retrieves a user from the available arguments.
	 */

	public async getUser(): Promise<User | null> {
		if (this.parser.finished) {
			return null;
		}

		return this.parser
			.singleParseAsync<User | null, null>(async parameter => {
				const userId = UserOrMemberMentionRegex.exec(parameter) ?? SnowflakeRegex.exec(parameter);
				const user = userId
					? await this.message.client.users.fetch(userId[1] as Snowflake).catch(() => null)
					: null;

				return Result.ok(user);
			})
			.then(result => result.unwrap());
	}

	/**
	 * Retrieves a channel from the available arguments.
	 *
	 * @param type The type of channel to retrieve.
	 * @default 'text'
	 */
	public async getChannel<K extends keyof ChannelReturnType = "text">(
		type: K = "text" as K
	): Promise<ChannelReturnType[K] | null> {
		if (this.parser.finished) {
			return null;
		}

		return this.parser
			.singleParseAsync<ChannelReturnType[K] | null, null>(async parameter => {
				const channelId = SnowflakeRegex.exec(parameter);
				const channel = channelId
					? await this.message.guild.channels.fetch(channelId[1]).catch(() => null)
					: null;

				if (!channel) {
					return Result.ok(null);
				}

				const validatedChannel = this._validateAndTransformChannel(channel, type);
				return Result.ok(validatedChannel as ChannelReturnType[K] | null);
			})
			.then(result => result.unwrap());
	}

	/**
	 * Retrieves a string from the available arguments.
	 */

	public getString(): string | null {
		return this.parser.finished
			? null
			: this.parser
					.singleParse<string | null, null>(parameter => {
						return Result.ok(parameter);
					})
					.unwrap();
	}

	/**
	 * Retrieves a number from the available arguments.
	 *
	 * @param min The minimum number to return. If not provided, no minimum is enforced.
	 * @param max The maximum number to return. If not provided, no maximum is enforced.
	 */

	public getNumber(min?: number, max?: number): number | null {
		if (this.parser.finished) {
			return null;
		}

		return this.parser
			.singleParse<number | null, null>(parameter => {
				const number = Number(parameter);

				if (Number.isNaN(number)) {
					return Result.ok(null);
				}

				// Clamp the number between min and max if provided
				const clampedNumber = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, number));
				return Result.ok(clampedNumber);
			})
			.unwrap();
	}

	/**
	 * Retrieves a boolean from the available arguments.
	 */
	public getBoolean(): boolean | null {
		if (this.parser.finished) {
			return null;
		}

		const trueValues = ["true", "yes", "y", "on", "enable", "enabled", "positive"];
		const falseValues = ["false", "no", "n", "off", "disable", "disabled", "negative"];

		return this.parser
			.singleParse<boolean | null, null>(parameter => {
				const value = parameter.trim().toLowerCase();

				if (trueValues.includes(value)) return Result.ok(true);
				if (falseValues.includes(value)) return Result.ok(false);

				return Result.ok(null);
			})
			.unwrap();
	}

	/**
	 * Retrieves all of the remaining arguments as a single string.
	 */

	public restString(): string | null {
		if (this.parser.finished) {
			return null;
		}

		this.parser.save();
		const str = join(this.parser.many().unwrapOr<WordParameter[]>([]));

		return str;
	}

	/**
     * Retrieves the last value of one or more options.

     * @param keys The name(s) of the option.
     */
	public getOption(...keys: readonly string[]): string | null {
		return this.parser.option(...keys).unwrapOr(null) || null;
	}

	/**
	 * Checks if one or more flag were given.
	 *
	 * @param keys The name(s) of the flag.
	 */
	public getFlags(...keys: readonly string[]): boolean {
		return this.parser.flag(...keys) ?? false;
	}

	/**
	 * Validates and transforms a channel based on the specified type.
	 */
	private _validateAndTransformChannel<K extends keyof ChannelReturnType>(
		channel: any,
		type: K
	): ChannelReturnType[K] | null {
		const channelTypeConfigs: Record<keyof ChannelReturnType, ChannelTypeConfig> = {
			category: { validator: isCategoryChannel },
			dm: { validator: isDMChannel },
			group: { validator: isGroupChannel },
			guild: { validator: isGuildBasedChannel },
			news: { validator: isNewsChannel },
			text: { validator: isTextBasedChannel },
			voice: { validator: isVoiceChannel },
			stage: { validator: isStageChannel },
			thread: { validator: isThreadChannel },
			newsThread: { validator: isNewsThreadChannel },
			publicThread: { validator: isPublicThreadChannel },
			privateThread: { validator: isPrivateThreadChannel },
			textBased: {
				validator: isTextBasedChannel,
				transform: ch => ch as Exclude<TextBasedChannelTypes, StageChannel | PartialGroupDMChannel>
			},
			voiceBased: { validator: isVoiceBasedChannel }
		};

		const config = channelTypeConfigs[type] || { validator: isTextChannel };

		if (!config.validator(channel)) {
			return null;
		}

		return config.transform ? config.transform(channel) : channel;
	}
}

interface ChannelReturnType {
	category: CategoryChannel;
	dm: DMChannel;
	group: PartialGroupDMChannel;
	guild: GuildTextBasedChannelTypes;
	news: NewsChannel;
	text: TextChannel;
	voice: VoiceChannel;
	stage: StageChannel;
	thread: ThreadChannel;
	newsThread: PublicThreadChannel;
	publicThread: PublicThreadChannel;
	privateThread: PrivateThreadChannel;
	textBased: Exclude<TextBasedChannelTypes, StageChannel | PartialGroupDMChannel>;
	voiceBased: VoiceBasedChannel;
}

interface ChannelTypeConfig {
	validator: ChannelValidatorFn;
	transform?: ChannelTransformFn;
}

type ChannelValidatorFn = (channel: GuildBasedChannel) => boolean;
type ChannelTransformFn = (channel: GuildBasedChannel) => any;
