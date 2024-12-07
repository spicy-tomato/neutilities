import { SCHOOL_SITE } from './const.js';

const HostValues = {
  SCHOOL_SITE: 1,
};

/**
 * @typedef {keyof HostValues} HostType
 */

export class ExtTab {
  /** @type Map.<HostType, string> */
  static #hostsMap = new Map([['SCHOOL_SITE', SCHOOL_SITE]]);

  /**
   * Add new alarm
   * @param {HostType} hostType
   * @param {string} path
   * @returns {Promise.<void>}
   */
  static async create(hostType, path) {
    const host = this.#hostsMap.get(hostType);
    if (!host) {
      console.warn('No hosted with type', hostType);
      return;
    }

    await chrome.tabs.create({
      url: host + path,
    });
  }
}
