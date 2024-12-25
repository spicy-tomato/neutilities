const DB_NAME = 'notificationsDb';
const STORE_NAME = 'notifications';

export class IndexedDbHelper {
  static #db = null;

  /**
   * Open the IndexedDB database.
   * @returns {Promise<IDBDatabase>} A promise that resolves to the opened database instance.
   */
  static async openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event) => {
        const db = /** @type {IDBRequest} */ (event.target).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) =>
        resolve(/** @type {IDBRequest} */ (event.target).result);
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Get the current IndexedDB database instance, opening it if necessary.
   * @returns {Promise<IDBDatabase>} A promise that resolves to the database instance.
   */
  static async getDb() {
    if (!this.#db) {
      this.#db = await this.openDb();
    }
    return this.#db;
  }

  /**
   * Save a record to the IndexedDB store.
   * @param {string} id - The unique identifier for the record.
   * @param {*} data - The data to store.
   * @returns {Promise<void>} A promise that resolves when the record is saved.
   */
  static async save(id, data) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record = { id, data, lastUpdatedAt: new Date().toISOString() };
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Retrieve all records from the IndexedDB store.
   * @returns {Promise<Array<{ id: string, data: *, lastUpdatedAt: string }>>}
   * A promise that resolves to an array of all records in the store.
   */
  static async getAll() {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) =>
        resolve(/** @type {IDBRequest} */ (event.target).result);
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Retrieve a record from the IndexedDB store.
   * @param {string} id - The unique identifier for the record.
   * @returns {Promise<*>} A promise that resolves to the retrieved data, or `null` if not found.
   */
  static async get(id) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (event) =>
        resolve(/** @type {IDBRequest} */ (event.target).result?.data ?? null);
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Delete a record from the IndexedDB store.
   * @param {string} id - The unique identifier for the record.
   * @returns {Promise<void>} A promise that resolves when the record is deleted.
   */
  static async delete(id) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }
}
