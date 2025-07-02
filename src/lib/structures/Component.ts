import { Awaitable, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import { client } from "@/index.js";

export default abstract class Component {
	/**
	 * The client that owns this component.
	 */

	public client = client;

	/**
	 * The custom ID of the component.
	 */

	public readonly id: CustomID;

	/**
	 * Constructor for the Component class.
	 *
	 * @param id The custom ID of the component.
	 */

	public constructor(id: CustomID) {
		this.id = id;
	}

	/**
	 * Handles the component interaction.
	 *
	 * @param interaction The component interaction.
	 */

	public abstract execute(interaction: ComponentInteraction): Awaitable<unknown>;
}

export type ComponentInteraction = MessageComponentInteraction | ModalSubmitInteraction;
export type CustomID =
	| string
	| { startsWith: string }
	| { endsWith: string }
	| { includes: string }
	| { matches: RegExp };
