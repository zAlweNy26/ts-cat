import { StrayKitten } from './stray-kitten.ts'

/**
 * The stray cat goes around tools and hook, making troubles
 */
export class StrayCat {
	#userId: string
	private chats: Map<string, StrayKitten> = new Map()

	constructor(userId: string) {
		this.#userId = userId
	}

	/**
	 * Get the user ID.
	 */
	get userId() {
		return this.#userId
	}

	/**
	 * Checks if a chat history exists for the given chat ID.
	 * @param chatId The ID that identifies a specific chat
	 * @returns True if a chat history exists, otherwise false
	 */
	hasChat(chatId: string) {
		return this.chats.has(chatId)
	}

	/**
	 * Retrieves the IDs of all available chats in the chat history.
	 * @returns An array of chat IDs.
	 */
	getAvailableChats(): string[] {
		return [...this.chats.keys()]
	}

	/**
	 * Retrieves a chat by its ID. If the chat does not exist, it creates a new one.
	 * @param chatId The unique identifier of the chat.
	 * @returns The chat associated with the given ID.
	 */
	getChat(chatId: string) {
		if (!this.hasChat(chatId)) this.chats.set(chatId, new StrayKitten(this.userId, chatId))
		return this.chats.get(chatId)!
	}

	/**
	 * Removes a chat from the collection.
	 * @param chatId The unique identifier of the chat to be removed.
	 * @returns A boolean indicating whether the chat was successfully removed.
	 */
	removeChat(chatId: string) {
		return this.chats.delete(chatId)
	}
}
