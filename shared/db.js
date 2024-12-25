const DB_NAME = 'notificationsDb';
const STORE_NAME = 'notifications';

/**
 * @typedef DbNotification
 * @property {string} id
 * @property {string} data
 * @property {string} lastUpdatedAt
 * @property {string} lastFetchedAt
 */

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
        const db = /** @type {IDBRequest<IDBDatabase>} */ (event.target).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) =>
        resolve(/** @type {IDBRequest<IDBDatabase>} */ (event.target).result);
      request.onerror = (event) =>
        reject(/** @type {IDBRequest<IDBDatabase>} */ (event.target).error);
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
   * @param {string} data - The data to store.
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
   * @returns {Promise<Array<DbNotification>>}
   * A promise that resolves to an array of all records in the store.
   */
  static async getAll() {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) =>
        resolve(
          /** @type {IDBRequest<Array<DbNotification>>} */ (event.target).result
        );
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Retrieve a record from the IndexedDB store.
   * @param {string} id - The unique identifier for the record.
   * @returns {Promise<DbNotification | null>} A promise that resolves to the retrieved data, or `null` if not found.
   */
  static async get(id) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (event) =>
        resolve(
          /** @type {IDBRequest<DbNotification>} */ (event.target).result ??
            null
        );
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

  /**
   * Delete all records with `lastFetchedAt` before specified `cutoffDate`.
   * @param {Date} cutoffDate - The reference date and time for pruning.
   * @returns {Promise<void>} A promise that resolves when the pruning is complete.
   */
  static async prune(cutoffDate) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = async (event) => {
        const records = /** @type {IDBRequest<Array<DbNotification>>} */ (
          event.target
        ).result;

        const deletePromises = records
          .filter((record) => new Date(record.lastFetchedAt) < cutoffDate)
          .map(
            (record) =>
              new Promise((resolve, reject) => {
                const deleteRequest = store.delete(record.id);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = (e) =>
                  reject(/** @type {IDBRequest} */ (e.target).error);
              })
          );

        try {
          await Promise.all(deletePromises);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }
  /**
   * Update the `lastFetchedAt` field of selected notifications to the current time.
   * @param {Array<string>} ids - The list of notification IDs to update.
   * @returns {Promise<void>} A promise that resolves when the updates are complete.
   */
  static async updateLastFetchedAt(ids) {
    console.log(ids);
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const currentTime = new Date().toISOString();

      const updatePromises = ids.map(
        (id) =>
          new Promise((resolve, reject) => {
            const getRequest = store.get(id);

            getRequest.onsuccess = (event) => {
              const record = /** @type {IDBRequest<DbNotification>} */ (
                event.target
              ).result;
              console.log(record);
              if (record) {
                record.lastFetchedAt = currentTime;
                const updateRequest = store.put(record);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = (e) =>
                  reject(/** @type {IDBRequest} */ (e.target).error);
              } else {
                resolve(); // No action if the record does not exist.
              }
            };

            getRequest.onerror = (e) =>
              reject(/** @type {IDBRequest} */ (e.target).error);
          })
      );

      Promise.all(updatePromises)
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  }
}
