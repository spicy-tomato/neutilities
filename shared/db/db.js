/**
 * @template T
 * @template {keyof T & string} V
 * @typedef {Object} GetParamType
 * @property {V} [GetType.field]
 * @property {T[V] | null} [GetType.value]
 * @property {IDBCursorDirection} [GetType.direction]
 * @property {number} [limit]
 */

/**
 * @template T Type of model
 */
export class Db {
  /**
   * @type {IDBDatabase | null}
   * @abstract
   */
  static db = null;

  /**
   * @type {string}
   * @abstract
   */
  static dbName;

  /**
   * @type {number}
   * @abstract
   */
  static version;

  /**
   * @type {string}
   * @abstract
   */
  static storeName;

  /**
   * @type {Object.<number, (event: IDBDatabase, transaction: IDBTransaction) => void>}
   * @abstract
   */
  static migrations;

  /**
   * @param {typeof Db<T>} dbClass
   */
  constructor(dbClass) {
    this.dbClass = dbClass;
  }

  /**
   * Open the IndexedDB database.
   * @returns {Promise<IDBDatabase>} A promise that resolves to the opened database instance.
   */
  static async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = /** @type {IDBRequest<IDBDatabase>} */ (event.target).result;
        const transaction = /** @type {IDBRequest<IDBDatabase>} */ (
          event.target
        ).transaction;
        const oldVersion = event.oldVersion || 0; // Old version or 0 if no version exists
        const newVersion = event.newVersion || this.version;

        console.log(
          `Upgrading database from version ${oldVersion} to ${newVersion}`
        );

        if (!transaction) {
          return;
        }

        // Apply migrations
        for (let version = oldVersion + 1; version <= newVersion; version++) {
          if (this.migrations[version]) {
            this.migrations[version](db, transaction);
          }
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
    if (!this.db) {
      this.db = await this.open();
    }
    return this.db;
  }

  /**
   * Save a record to the IndexedDB store.
   * @param {Partial<T>} data - The data to store.
   * @returns {Promise<void>} A promise that resolves when the record is saved.
   */
  async save(data) {
    const db = await this.dbClass.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.dbClass.storeName, 'readwrite');
      const store = transaction.objectStore(this.dbClass.storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Update partially a record in IndexedDB store
   * @param {IDBValidKey} id
   * @param {Partial<T>} value
   * @returns {Promise<void>}
   */
  async patch(id, value) {
    const db = await this.dbClass.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.dbClass.storeName, 'readwrite');
      const store = transaction.objectStore(this.dbClass.storeName);

      const getRequest = store.get(id);

      getRequest.onsuccess = (event) => {
        let record = /** @type {IDBRequest<T>} */ (event.target).result;
        const newValue = record ? { ...record, ...value } : { id, ...value };
        const updateRequest = store.put(newValue);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = (e) =>
          reject(/** @type {IDBRequest} */ (e.target).error);
      };

      getRequest.onerror = (e) =>
        reject(/** @type {IDBRequest} */ (e.target).error);
    });
  }

  /**
   * Retrieve all records from the IndexedDB store.
   * @returns {Promise<Array<T>>}
   * A promise that resolves to an array of all records in the store.
   */
  async getAll() {
    const db = await this.dbClass.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.dbClass.storeName, 'readonly');
      const store = transaction.objectStore(this.dbClass.storeName);
      const request = store.getAll();

      request.onsuccess = (event) =>
        resolve(/** @type {IDBRequest<Array<T>>} */ (event.target).result);
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Retrieve a record from the IndexedDB store.
   * @param {IDBValidKey} id - The unique identifier for the record.
   * @returns {Promise<T | null>} A promise that resolves to the retrieved data, or `null` if not found.
   */
  async getById(id) {
    const db = await this.dbClass.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.dbClass.storeName, 'readonly');
      const store = transaction.objectStore(this.dbClass.storeName);
      const request = store.get(id);

      request.onsuccess = (event) =>
        resolve(/** @type {IDBRequest<T> } */ (event.target).result ?? null);
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Retrieve all records from the IndexedDB store.
   * @template {keyof T & string} V
   * @param {GetParamType<T, V>} param
   * @returns {Promise<Array<T>>}
   * A promise that resolves to an array of records according conditions in the store.
   */
  async get(param) {
    const db = await this.dbClass.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.dbClass.storeName, 'readonly');
      const store = transaction.objectStore(this.dbClass.storeName);

      /** @type {Array<T>} */
      const result = [];
      /** @type {IDBRequest<IDBCursorWithValue | null>} */
      let cursorRequest;

      if (param.field) {
        if (!store.indexNames.contains(param.field)) {
          console.warn(`Index ${param.field} does not exist`);
          return;
        }

        if (param.value === null) {
          cursorRequest = store.openCursor();
        } else {
          cursorRequest = store
            .index(param.field)
            .openCursor(null, param.direction);
        }
      } else {
        cursorRequest = store.openCursor();
      }

      cursorRequest.onsuccess = (event) => {
        const cursor = /** @type {IDBRequest<IDBCursorWithValue>} */ (
          event.target
        ).result;

        if (cursor && (!param.limit || result.length < param.limit)) {
          if (
            param.value === undefined ||
            cursor.value[param.field] === param.value ||
            (param.value === null &&
              (cursor.value[param.field] === null ||
                cursor.value[param.field] === undefined))
          ) {
            result.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      cursorRequest.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }

  /**
   * Remove a record from the IndexedDB store.
   * @param {IDBValidKey} id - The unique identifier for the record.
   * @returns {Promise<void>} A promise that resolves when the record is deleted.
   */
  async remove(id) {
    const db = await this.dbClass.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.dbClass.storeName, 'readwrite');
      const store = transaction.objectStore(this.dbClass.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) =>
        reject(/** @type {IDBRequest} */ (event.target).error);
    });
  }
}
