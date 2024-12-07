export class ExtBadge {
  /**
   * Set badge text
   * @param {string} text
   * @returns {Promise.<void>}
   */
  static async setText(text) {
    await chrome.action.setBadgeText({ text });
  }

  /**
   * Clear badge text
   * @returns {Promise.<void>}
   */
  static async clear() {
    await chrome.action.setBadgeText({ text: '' });
  }
}
