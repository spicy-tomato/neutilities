import { SCHOOL_SITE } from '../shared/const.js';
import { NotificationMinifier } from './minify-notification.js';

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

      if (!htmlElement) {
        return null;
      }

      const html = NotificationMinifier.minify(htmlElement.getHTML());
      return html;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return null;
    }
  }

  /**
   * Retrieve notification DOM
   * @param {string} url
   * @returns {Promise.<Element | null>}
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
}
