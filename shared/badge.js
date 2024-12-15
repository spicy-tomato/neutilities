export class ExtBadge {
  /**
   * Setup styles for badge
   * @returns {Promise.<void>}
   */
  static async setup() {
    await chrome.action.setBadgeBackgroundColor({ color: '#e863b4' });
  }

  /**
   * Set badge text as `new`
   * @returns {Promise.<void>}
   */
  static async setNew() {
    this.#setText('new');
  }

  /**
   * Clear badge text
   * @returns {Promise.<void>}
   */
  static async clear() {
    await chrome.action.setBadgeText({ text: '' });
  }

  /**
   * Set badge text
   * @param {string} text
   * @returns {Promise.<void>}
   */
  static async #setText(text) {
    await chrome.action.setBadgeText({ text });
  }
}
