export class ExtStorage {
  static #postsLinkConcatenationKey = 'postsLinkConcatenation';

  /**
   * Save latest notification's url concatenation
   * @param {Array.<import('../functions/fetch-notification').NeuNotification>} notifications
   * @returns {Promise.<void>}
   */
  static async setPostsLinkConcatenation(notifications) {
    const concatenation = notifications.map((n) => n.href).join('');
    await chrome.storage.sync.set({
      [this.#postsLinkConcatenationKey]: concatenation,
    });
  }

  /**
   * Get latest notification's url concatenation
   * @returns {Promise.<string | undefined>}
   */
  static async getPostsLinkConcatenation() {
    return (await chrome.storage.sync.get(this.#postsLinkConcatenationKey))?.[
      this.#postsLinkConcatenationKey
    ];
  }
}
