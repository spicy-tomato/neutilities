import { ListStorage } from './list.storage.js';
import { PinStorage } from './pin.storage.js';

export class StorageHelper {
  /**
   * Remove temporary data from storage
   * @param {(import('./storage').StorageType)} [type]
   * @returns {Promise.<void>}
   */
  async clean(type) {
    const cleanPromises = type
      ? this.storage.filter((s) => s.type === type).map((s) => s.clean())
      : this.storage.map((s) => s.clean());
    await Promise.all(cleanPromises);
  }

  /**
   * Clear storage
   * @returns {Promise.<void>}
   */
  async clear() {
    await chrome.storage.sync.clear();
  }

  get storage() {
    return [new ListStorage(), new PinStorage()];
  }
}
