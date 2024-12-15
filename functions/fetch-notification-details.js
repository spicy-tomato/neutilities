import { SCHOOL_SITE } from '../shared/const.js';

export class NotificationDetailsFetcher {
  /**
   * Fetch notification from url
   * @param {string} url
   * @returns {Promise.<string | null>}
   */
  async fetchAndMinify(url) {
    try {
      const htmlElement =
        await NotificationDetailsFetcher.#retrieveNotificationDom(url);
      const html = NotificationDetailsFetcher.#minify(htmlElement.getHTML());

      return html;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return null;
    }
  }

  /**
   * Retrieve notification DOM
   * @param {string} url
   * @returns {Promise.<Element>}
   */
  static async #retrieveNotificationDom(url) {
    const response = await fetch(SCHOOL_SITE + url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const pageContent = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageContent, 'text/html');

    const domNotificationElement = doc.querySelector('.divmain');

    return domNotificationElement;
  }

  /**
   * Retrieve notification DOM
   * @param {string} html
   * @returns {string}
   */
  static #minify(html) {
    // Remove comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Remove unnecessary whitespace
    html = html
      .replace(/\s{2,}/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();

    // Remove empty tags
    html = html.replace(/<(\w+)([^>]*)>\s*<\/\1>/g, '');

    return html;
  }
}
