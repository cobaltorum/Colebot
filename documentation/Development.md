# Developing In The Template

This section of the documentation will help you understand how this template should be used and extended.

> [!NOTE]
> Please keep in mind that this documentation follows practices that I use and my programming style. Yours might be completely different, and that's fine!

# Creating New Handlers

## Commands

In order to create a new command handler, create a new file in the `commands` directory. The file should export a default class that extends [Command](../src/lib/structures/Command.ts) and is passed `CommandOptions` in the `super()` method.

### Message Command

```ts
import { ApplicationCommandType, ChatInputCommandInteraction, Message } from "discord.js";

import Command, { CommandCategory } from "@structures/Command.js";

export default class Example extends Command {
	constructor() {
		super({
			name: "example",
			aliases: ["alias-1", "alias-2"],
			category: CommandCategory.General,
			description: "Example description."
		});
	}

	/**
	 * Since the `registerAppCommand()` method doesn't get implemented in the subclass,
	 * this method is redundant as the command won't be published to Discord.
	 */

	override async executeInteraction(interaction: ChatInputCommandInteraction) {
		return interaction.reply({
			content: `Example response.`
		});
	}

	override async executeMessage(message: Message<true>) {
		return message.reply({
			content: `Example response.`
		});
	}
}
```

### Application Command

```ts
import { ApplicationCommandType, ChatInputCommandInteraction, Message } from "discord.js";

import Command, { CommandCategory } from "@structures/Command.js";

export default class Example extends Command {
	constructor() {
		super({
			name: "example",
			aliases: ["alias-1", "alias-2"],
			category: CommandCategory.General,
			description: "Example description."
		});
	}

	/**
	 * This will assign the returned object to the `data` property of the class,
	 * which will cause the command to be registered to Discord.
	 */

	override registerAppCommand(): ApplicationCommandData {
		return {
			name: this.name,
			type: ApplicationCommandType.ChatInput,
			description: this.description
		};
	}

	override async executeInteraction(interaction: ChatInputCommandInteraction) {
		return interaction.reply({
			content: `Example response.`
		});
	}

	override async executeMessage(message: Message<true>) {
		return message.reply({
			content: `Example response.`
		});
	}
}
```

## Components

Components are similar to commands, but are used for buttons, select menus, and modals. In order to create a new component handler, create a new file in the `components` directory. This file should export a default class that extends [Component](../src/lib/structures/Component.ts) and is passed a `CustomID` in the `super()` method.

```ts
import { ButtonInteraction } from "discord.js";

import Component from "@structures/Component.js";

export default class Example extends Component {
	constructor() {
		super({ startsWith: "example" });
	}

	async execute(interaction: ButtonInteraction) {
		return interaction.reply({
			content: `You clicked a buttton.`
		});
	}
}
```

You need to ensure you're receiving the correct interaction type for the provided custom ID. For example if you create a button with the custom ID `some-button` the component that handles that button will receive a `ButtonInteraction` in the `execute()` method. Additionally, here's how type of custom ID behaves.

```ts
import Component from "@structures/Component.js";

export default class Example extends Component {
	constructor() {
		// Will only match components that start with the specified phrase.
		super({ startsWith: "example" });
		// Will only match components that end with the specified phrase.
		super({ endsWith: "example" });
		// Will only match components that include the specified phrase in their custom ID.
		super({ includes: "example" });
		// Will only match components that match a specific regex.
		// In this case a custom ID with this format: `user-info-1234567891276342719`.
		super({ matches: /^user-info-\d{17,19}$/m });
		// Will only match components with this EXACT custom ID.
		super("exact-example");
	}
}
```

## EventListeners

EventListeners are used to handle events emitted by discord.js. In order to create a new event listener handle, create a new file in the `events` directory. This file should export a default class that extends [EventListener](../src/lib/structures/EventListener.ts) and is passed a `string` or `Events` property, and an optional `boolean` in the `super()` method which indicates if the handler will only run once in it's lifetime.

```ts
import { Events, Guild } from "discord.js";

import EventListener from "@structures/EventListener.js";
import Logger from "@utils/Logger.js";

export default class Example extends EventListener {
	constructor() {
		super(Events.GuildCreate);
	}

	async execute(guild: Guild) {
		Logger.info(`The client joined a guild with the name: ${guild.name}!`);
	}
}
```

# Best Practices

The resouces provided below are what have helped me personally learn JavaScript/TypeScript at the deeper level. They also help with styling your code for maximum readability, organization, and structure. I'd recommend giving them a try!

## Styling

- [Google's TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Mkosir’s TypeScript Style Guide](https://mkosir.github.io/typescript-style-guide/)
- [W.W. Norton TS Style Guide](https://wwnorton.github.io/style/docs/typescript/)

## Runtime/Performance

- [Optimizing TypeScript For Better Performance](https://www.sharpcoderblog.com/blog/how-to-optimize-your-typescript-code-for-better-performance?utm_source=chatgpt.com)
- [JavaScript Performance Tips](https://medium.com/no-nonsense-backend/8-javascript-performance-tips-i-discovered-after-years-of-coding-56ab5fae43af)
- [Memory Optimization in JavaScript](https://medium.com/%40kumarashish87998/memory-optimization-in-javascript-best-practices-for-high-performance-applications-4e3404a5ef04)
