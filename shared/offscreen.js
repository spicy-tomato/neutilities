export class ExtOffscreen {
  /**
   * Create offscreen document from a template
   * @param {string} url
   * @param {chrome.offscreen.Reason} reason
   * @param {string} justification
   * @returns {Promise.<void>}
   */
  static async createDocument(url, reason, justification) {
    try {
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL(url),
        reasons: [reason],
        justification,
      });
    } catch (error) {
      if (
        !(
          /** @type {*} */ (error).message?.startsWith(
            'Only a single offscreen'
          )
        )
      ) {
        throw error;
      }
    }
  }
}
