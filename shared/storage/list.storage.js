import { ExtStorage } from './storage.js';

/**
 * @extends {ExtStorage<Array<string>,Array<string>>}
 */
export class ListStorage extends ExtStorage {
  static #key = 'LIST';

  constructor() {
    super(ListStorage.#key, [], 'extension');
  }
}
