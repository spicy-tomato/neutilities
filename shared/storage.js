export class ExtStorage {
  static #postsLinkConcatenationKey = 'postsLinkConcatenation';

  /**
   * Clear storage
   * @returns {Promise.<string | undefined>}
   */
  static async clear() {
    await chrome.storage.sync.clear();
  }

  /**
   * Save latest notification's url concatenation
   * @param {Array.<import('../functions/fetch-notification').NeuNotification>} notifications
   * @returns {Promise.<void>}
   */
  static async setNotificationsListCache(notifications) {
    const concatenation = notifications.map((n) => n.href).join('');
    await chrome.storage.sync.set({
      [this.#postsLinkConcatenationKey]: concatenation,
    });
  }

  /**
   * Get latest notification's url concatenation
   * @returns {Promise.<string | undefined>}
   */
  static async getNotificationsListCache() {
    return (await chrome.storage.sync.get(this.#postsLinkConcatenationKey))?.[
      this.#postsLinkConcatenationKey
    ];
  }
}
