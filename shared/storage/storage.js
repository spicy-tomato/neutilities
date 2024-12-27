/** @typedef {'extension' | 'user'} StorageType */

/**
 * @abstract
 * @template TS Storage type
 * @template TO Output type
 */
export class ExtStorage {
  /**
   * @protected
   * @param {string} key Key of storage
   * @param {TS} defaultValue Fallback value if key is not set
   * @param {StorageType} type
   */
  constructor(key, defaultValue, type) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.type = type;
  }

  /**
   * Get value from Chrome storage
   * @returns {Promise.<TO>}
   */
  async get() {
    return (
      (await chrome.storage.sync.get(this.key))?.[this.key] ?? this.defaultValue
    );
  }

  /**
   * Set value to Chrome storage
   * @param {TS} value
   * @returns {Promise.<void>}
   */
  async set(value) {
    await chrome.storage.sync.set({
      [this.key]: value,
    });
  }

  /**
   * Remove value from Chrome storage
   */
  async clean() {
    await chrome.storage.sync.remove(this.key);
  }
}
