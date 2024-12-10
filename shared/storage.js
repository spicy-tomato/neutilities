export class ExtStorage {
  static #latestNotificationKey = 'latestNotification';

  /**
   * Save latest notification's url
   * @param {string} href
   * @returns {Promise.<void>}
   */
  static async setLatestNotification(href) {
    await chrome.storage.sync.set({
      [this.#latestNotificationKey]: href,
    });
  }

  /**
   * Get latest notification's url
   * @returns {Promise.<string | undefined>}
   */
  static async getLatestNotification() {
    return (await chrome.storage.sync.get(this.#latestNotificationKey))?.[
      this.#latestNotificationKey
    ];
  }
}
