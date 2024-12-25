import { IndexedDbHelper } from './db.js';

export class ExtStorage {
  static #notificationsKey = 'NOTIFICATIONS_LIST';
  static #changedNotificationsKey = 'CHANGED_NOTIFICATIONS';
  static #pinnedNotificationsKey = 'PINNED_NOTIFICATIONS';

  static #temporaryKeys = [
    this.#notificationsKey,
    this.#changedNotificationsKey,
  ];

  /**
   * Remove temporary data from storage
   * @returns {Promise.<void>}
   */
  static async clean() {
    const removeStoragePromises = this.#temporaryKeys.map((key) =>
      this.#remove(key)
    );
    await Promise.all(removeStoragePromises);
  }

  /**
   * Clear storage
   * @returns {Promise.<void>}
   */
  static async clear() {
    await chrome.storage.sync.clear();
  }

  /**
   * Get notifications' url concatenation
   * @returns {Promise.<Array<string>>}
   */
  static async getNotificationsListCache() {
    return (await this.#get(this.#notificationsKey)) ?? [];
  }

  /**
   * Save notifications' url concatenation
   * @param {Array.<string>} notificationUrls
   * @returns {Promise.<void>}
   */
  static async setNotificationsListCache(notificationUrls) {
    await this.#set(this.#notificationsKey, notificationUrls);
  }

  /**
   * Get pinned notifications' url
   * @returns {Promise.<Set<string>>}
   */
  static async getPinnedNotificationUrls() {
    const urls = (await this.#get(this.#pinnedNotificationsKey)) ?? [];
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
        this.#pinnedNotificationsKey,
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
      this.#pinnedNotificationsKey,
      Array.from(pinnedNotificationsList)
    );
  }

  /**
   * Get saved notifications from storage
   * @returns {Promise.<Map<string, string>>}
   */
  static async getSavedNotifications() {
    const notifications = await IndexedDbHelper.getAll();
    const savedNotifications = new Map(
      notifications.map((x) => [x.id, x.data])
    );
    return savedNotifications;
  }

  /**
   * Saved notification content to storage
   * @param {string} url
   * @param {string} content
   * @returns {Promise.<void>}
   */
  static async saveNotification(url, content) {
    await IndexedDbHelper.save(url, content);
  }

  /**
   * Update the `lastFetchedAt` field of selected notifications to the current time.
   * @param {Array<string>} ids - The list of notification IDs to update.
   * @returns {Promise<void>} A promise that resolves when the updates are complete.
   */
  static async updateLastFetchedAt(ids) {
    await IndexedDbHelper.updateLastFetchedAt(ids);
  }

  /**
   * Remove saved notification from storage
   * @param {string} url
   * @returns {Promise.<void>}
   */
  static async removeNotification(url) {
    await IndexedDbHelper.delete(url);
  }

  /**
   * Remove saved notification from storage
   * @param {Date} cutoffDate
   * @returns {Promise.<void>}
   */
  static async pruneNotification(cutoffDate) {
    await IndexedDbHelper.prune(cutoffDate);
  }

  /**
   * Get list of changed notifications
   * @returns {Promise.<Array<string>>}
   */
  static async getChangedNotifications() {
    return (await this.#get(this.#changedNotificationsKey)) ?? [];
  }

  /**
   * Update list of changed notifications
   * @param {Array.<string>} urls
   * @returns {Promise.<void>}
   */
  static async setChangedNotifications(urls) {
    await this.#set(this.#changedNotificationsKey, urls);
  }

  /**
   * Remove a notification from changed list
   * @param {string} url
   * @returns {Promise.<void>}
   */
  static async removeChangedNotification(url) {
    const oldList = await this.getChangedNotifications();
    await this.setChangedNotifications(oldList.filter((n) => n !== url));
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

  /**
   * Set value to Chrome storage
   * @param {string} key
   * @returns {Promise.<void>}
   */
  static async #remove(key) {
    await chrome.storage.sync.remove(key);
  }
}
