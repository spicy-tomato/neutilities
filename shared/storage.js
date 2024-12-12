export class ExtStorage {
  static #notificationsListKey = 'notificationsListKey';
  static #pinnedNotificationsListKey = 'pinnedNotificationsListKey';
  static #temporaryKeys = [this.#notificationsListKey];

  /**
   * Clear storage
   * @returns {Promise.<void>}
   */
  static async clean() {
    const removeStoragePromises = this.#temporaryKeys.map(
      async (key) => await chrome.storage.sync.remove(key)
    );
    await Promise.all(removeStoragePromises);
  }

  /**
   * Get notifications' url concatenation
   * @returns {Promise.<Array<string>>}
   */
  static async getNotificationsListCache() {
    return (await this.#get(this.#notificationsListKey)) ?? [];
  }

  /**
   * Save notifications' url concatenation
   * @param {Array.<string>} notificationUrls
   * @returns {Promise.<void>}
   */
  static async setNotificationsListCache(notificationUrls) {
    await this.#set(this.#notificationsListKey, notificationUrls);
  }

  /**
   * Get pinned notifications' url
   * @returns {Promise.<Set<string>>}
   */
  static async getPinnedNotificationUrls() {
    const urls = (await this.#get(this.#pinnedNotificationsListKey)) ?? [];
    return new Set(urls);
  }

  /**
   * Add pinned notification's url
   * @param {string} url
   * @returns {Promise.<void>}
   */
  static async addPinnedNotification(url) {
    const pinnedNotificationUrls = await this.getPinnedNotificationUrls();

    if (!pinnedNotificationUrls.has(url)) {
      pinnedNotificationUrls.add(url);

      await this.#set(
        this.#pinnedNotificationsListKey,
        Array.from(pinnedNotificationUrls)
      );
    }
  }

  /**
   * Remove pinned notification's url
   * @param {string} url
   * @returns {Promise.<void>}
   */
  static async removePinnedNotification(url) {
    let pinnedNotificationsList = await this.getPinnedNotificationUrls();

    pinnedNotificationsList.delete(url);

    await this.#set(
      this.#pinnedNotificationsListKey,
      Array.from(pinnedNotificationsList)
    );
  }

  /**
   * Get value from Chrome storage
   * @param {string} key
   * @returns {Promise}
   */
  static async #get(key) {
    return (await chrome.storage.sync.get(key))?.[key];
  }

  /**
   * Set value to Chrome storage
   * @param {string} key
   * @param {*} value
   * @returns {Promise.<void>}
   */
  static async #set(key, value) {
    await chrome.storage.sync.set({
      [key]: value,
    });
  }
}
