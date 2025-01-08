import { EXTENSION_URL, REPOSITORY_URL, SCHOOL_SITE } from './const.js';

const HostValues = {
  SCHOOL_SITE: 1,
  REPOSITORY_URL: 2,
  EXTENSION_URL: 3,
};

/**
 * @typedef {keyof HostValues} HostType
 */

export class ExtTab {
  /** @type Map.<HostType, string> */
  static #hostsMap = new Map([
    ['SCHOOL_SITE', SCHOOL_SITE],
    ['REPOSITORY_URL', REPOSITORY_URL],
    ['EXTENSION_URL', EXTENSION_URL],
  ]);

  /**
   * Open new tab
   * @param {HostType} hostType
   * @param {string} [path] - relative path to host URL
   * @returns {Promise.<void>}
   */
  static async openExternal(hostType, path) {
    const host = this.#hostsMap.get(hostType);
    if (!host) {
      console.warn('No hosted with type', hostType);
      return;
    }

    await chrome.tabs.create({
      url: host + (path ?? ''),
    });
  }

  /**
   * Open offline tab
   * @param {string} content - relative path to host URL
   * @returns {Promise.<void>}
   */
  static async openWithContent(content) {
    const blob = new Blob(
      [
        `<!DOCTYPE html>
          <html>
            <head>
              <title>Neutilities - đọc ngoại tuyến</title>
              <meta charset="UTF-8">
            </head>
            <body>
              <div class="content">${content}</div>
            </body>
          </html>`,
      ],
      { type: 'text/html' }
    );
    const offlineUrl = URL.createObjectURL(blob);

    await chrome.tabs.create({ url: offlineUrl });
  }
}
