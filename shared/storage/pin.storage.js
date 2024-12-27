import { ExtStorage } from './storage.js';

/**
 * @extends {ExtStorage<Array<string>,Set<string>>}
 */
export class PinStorage extends ExtStorage {
  static #key = 'PIN';

  constructor() {
    super(PinStorage.#key, [], 'user');
  }

  /**
   * Get pinned notifications' url
   * @override
   * @returns {Promise.<Set<string>>}
   */
  async get() {
    const urls = (await super.get()) ?? [];
    return new Set(urls);
  }

  /**
   * Add pinned notification's url
   * @param {string} url
   * @returns {Promise.<void>}
   */
  async add(url) {
    const pinnedNotificationUrls = await this.get();

    if (!pinnedNotificationUrls.has(url)) {
      pinnedNotificationUrls.add(url);

      await this.set(Array.from(pinnedNotificationUrls));
    }
  }

  /**
   * Remove pinned notification's url
   * @param {string} url
   * @returns {Promise.<void>}
   */
  async removePinnedNotification(url) {
    let pinnedNotificationsList = await this.get();

    pinnedNotificationsList.delete(url);

    await this.set(Array.from(pinnedNotificationsList));
  }
}
