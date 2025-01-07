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
  static async create(hostType, path) {
    const host = this.#hostsMap.get(hostType);
    if (!host) {
      console.warn('No hosted with type', hostType);
      return;
    }

    await chrome.tabs.create({
      url: host + (path ?? ''),
    });
  }
}
