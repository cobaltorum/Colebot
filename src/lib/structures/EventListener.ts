import { Awaitable, Events } from "discord.js";
import { client } from "@/index.js";

export default abstract class EventListener {
	/**
	 * The client this listener is attached to.
	 */

	public client = client;

	/**
	 * The event that this listener listens for.
	 */

	public readonly event: Events | string;

	/**
	 * Whether the event should only be listened for once.
	 */

	public readonly once: boolean;

	/**
	 * Constructs a new EventListener.
	 *
	 * @param event The event that this listener listens for.
	 * @param once Whether the event should only be listened for once.
	 */
	public constructor(event: Events | string, once?: boolean) {
		this.event = event;
		this.once = once ?? false;
	}

	/**
	 * Handler that is called when the event is triggered.
	 *
	 * @param args The arguments to pass to the event listener.
	 */
	public abstract execute(...args: unknown[]): Awaitable<unknown>;
}
