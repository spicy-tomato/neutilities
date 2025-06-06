import { Db } from './db.js';

/**
 * @typedef DbNotification
 * @property {string} id
 * @property {string} [data]
 * @property {string} [lastUpdatedAt]
 * @property {string} lastFetchedAt
 * @property {number} [isUpdated]
 */

/**
 * @extends {Db<DbNotification>}
 */
export class NotificationDb extends Db {
  static db = null;
  static dbName = 'notificationsDb';
  static version = 2;
  static storeName = 'notifications';

  constructor() {
    super(NotificationDb);
  }

  /**
   * Delete all records with `lastFetchedAt` before specified `cutoffDate`.
   * @param {Date} cutoffDate - The reference date and time for pruning.
   * @returns {Promise<void>} A promise that resolves when the pruning is complete.
   */
  async prune(cutoffDate) {
    const db = await NotificationDb.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NotificationDb.storeName, 'readwrite');
      const store = transaction.objectStore(NotificationDb.storeName);
      const request = store.getAll();

      request.onsuccess = async (event) => {
        const records = /** @type {IDBRequest<Array<DbNotification>>} */ (
          event.target
        ).result;

        const deletePromises = records
          .filter((record) => new Date(record.lastFetchedAt) < cutoffDate)
          .map(
            (record) =>
              /** @type {Promise<void>} */ (
                new Promise((resolve, reject) => {
                  const deleteRequest = store.delete(record.id);
                  deleteRequest.onsuccess = () => resolve();
                  deleteRequest.onerror = (e) =>
                    reject(/** @type {IDBRequest} */ (e.target).error);
                })
              )
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

  /** @type {Object.<number, (event: IDBDatabase, transaction: IDBTransaction) => void>} */
  static migrations = {
    1: (db) => {
      const store = db.createObjectStore(this.storeName, {
        keyPath: 'id',
      });

      store.createIndex('lastUpdatedAt', 'lastUpdatedAt', {
        unique: false,
      });
      store.createIndex('lastFetchedAt', 'lastFetchedAt', {
        unique: false,
      });
      store.createIndex('isUpdated', 'isUpdated', {
        unique: false,
      });
    },
    2: (db, tx) => {
      /** @type {Promise<void>} */ (
        new Promise((resolve, reject) => {
          tx.oncomplete = () => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = (event) => {
              const records = /** @type {IDBRequest<Array<DbNotification>>} */ (
                event.target
              ).result;

              records.forEach((r) => (r.isUpdated = r.isUpdated ? 1 : 0));

              resolve();
            };
            request.onerror = (event) =>
              reject(/** @type {IDBRequest} */ (event.target).error);
          };
        })
      );
    },
  };
}
