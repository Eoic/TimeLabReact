import { StorageError } from './errors';
import { err, ok, type Result } from '../shared/result';

export type IDBRecord = Record<string, unknown> & { id: string };

const DB_VERSION = 2;
const DB_NAME = 'timelab';
export const STORE_PROJECTS = 'projects';

let cachedFactory: IDBFactory | null = null;
let cachedDatabase: IDBDatabase | null = null;
let cachedDatabasePromise: Promise<IDBDatabase> | null = null;

export function makeOpenDatabase(
  factory: IDBFactory,
  name: string,
  version: number,
  stores: readonly string[],
): () => Promise<IDBDatabase> {
  return () =>
    new Promise((resolve, reject) => {
      const request = factory.open(name, version);

      request.onupgradeneeded = (): void => {
        const database = request.result;

        for (const store of stores) {
          if (!database.objectStoreNames.contains(store)) {
            database.createObjectStore(store, { keyPath: 'id' });
          }
        }
      };

      request.onsuccess = (): void => {
        resolve(request.result);
      };

      request.onerror = (): void => {
        reject(request.error ?? new Error('Failed to open the database'));
      };
    });
}

function _clearDatabaseCache(): void {
  const database = cachedDatabase;
  const databasePromise = cachedDatabasePromise;

  cachedFactory = null;
  cachedDatabase = null;
  cachedDatabasePromise = null;

  database?.close();

  if (!database) {
    void databasePromise?.then((database) => database.close()).catch(() => undefined);
  }
}

function _openDatabase(): Promise<IDBDatabase> {
  const factory = globalThis.indexedDB;

  if (cachedFactory !== factory) {
    _clearDatabaseCache();
    cachedFactory = factory;
  }

  cachedDatabasePromise ??= makeOpenDatabase(factory, DB_NAME, DB_VERSION, [STORE_PROJECTS])()
    .then((database) => {
      cachedDatabase = database;

      database.onversionchange = (): void => {
        _clearDatabaseCache();
      };

      return database;
    })
    .catch((error: unknown) => {
      _clearDatabaseCache();
      throw error;
    });

  return cachedDatabasePromise;
}

function _ensureStoreExists(database: IDBDatabase, storeName: string): Result<void, StorageError> {
  if (database.objectStoreNames.contains(storeName)) {
    return ok(undefined);
  }

  const errorMessage = [
    `Missing IndexedDB store "${storeName}".`,
    `Available stores: ${Array.from(database.objectStoreNames).join(', ')}`,
  ].join(' ');

  return err(new StorageError(errorMessage));
}

function _waitForTransaction(transaction: IDBTransaction, fallbackMessage: string): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = (): void => {
      resolve();
    };

    transaction.onerror = (): void => {
      reject(transaction.error ?? new Error(fallbackMessage));
    };

    transaction.onabort = (): void => {
      reject(transaction.error ?? new Error(fallbackMessage));
    };
  });
}

async function _fetch<T>(
  database: IDBDatabase,
  storeName: string,
  storeAction: string,
  storeRequest: (store: IDBObjectStore) => IDBRequest,
) {
  const storeResult = _ensureStoreExists(database, storeName);

  if (!storeResult.ok) {
    throw storeResult.error;
  }

  return await new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = storeRequest(store);

    request.onsuccess = (): void => {
      resolve(request.result as T);
    };

    request.onerror = (): void => {
      reject(request.error ?? new Error(`Failed to ${storeAction} from ${storeName}.`));
    };
  });
}

export async function getAllRecords<T extends IDBRecord>(storeName: string): Promise<Result<T[], StorageError>> {
  try {
    const database = await _openDatabase();
    const result = await _fetch<T[]>(database, storeName, 'getAllRecords()', (store) => store.getAll());
    return ok(result);
  } catch (error) {
    return err(new StorageError('Failed to retrieve records', error));
  }
}

export async function getRecord<T extends IDBRecord>(id: string, storeName: string): Promise<Result<T, StorageError>> {
  try {
    const database = await _openDatabase();
    const result = await _fetch<T | undefined>(database, storeName, 'getRecord()', (store) => store.get(id));

    if (!result) {
      throw new Error('Record does not exist');
    }

    return ok(result);
  } catch (error) {
    return err(new StorageError(`Failed to retrieve record with id=${id}`, error));
  }
}

async function _saveRecord<T extends IDBRecord>(
  record: T,
  storeName: string,
  storeAction: (store: IDBObjectStore, record: T) => IDBRequest,
): Promise<Result<T, StorageError>> {
  try {
    const database = await _openDatabase();
    const storeResult = _ensureStoreExists(database, storeName);

    if (!storeResult.ok) {
      return storeResult;
    }

    const transaction = database.transaction(storeName, 'readwrite');
    const transactionFinished = _waitForTransaction(transaction, 'Failed to commit record.');

    await new Promise<void>((resolve, reject) => {
      const store = transaction.objectStore(storeName);
      const request = storeAction(store, record);

      request.onsuccess = (): void => {
        resolve();
      };

      request.onerror = (): void => {
        reject(request.error ?? new Error('Failed to perform action'));
      };
    });

    await transactionFinished;

    return ok(record);
  } catch (error) {
    return err(new StorageError('Failed to save record', error));
  }
}

export async function insertRecord<T extends IDBRecord>(record: T, storeName: string) {
  return _saveRecord(record, storeName, (store, record) => store.add(record));
}

export async function updateRecord<T extends IDBRecord & { id: string }>(record: T, storeName: string) {
  const result = await getRecord<T>(record.id, storeName);

  if (!result.ok) {
    return err(new StorageError('Failed to acquire existing record', result.error));
  }

  return await _saveRecord(record, storeName, (store, record) => store.put(record));
}

export async function deleteRecord(id: string, storeName: string): Promise<Result<void, StorageError>> {
  try {
    const database = await _openDatabase();
    const storeResult = _ensureStoreExists(database, storeName);

    if (!storeResult.ok) {
      return storeResult;
    }

    const transaction = database.transaction(storeName, 'readwrite');
    const transactionFinished = _waitForTransaction(transaction, `Failed to delete record with id=${id}.`);

    await new Promise<void>((resolve, reject) => {
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = (): void => {
        resolve();
      };

      request.onerror = (): void => {
        reject(request.error ?? new Error(`Failed to delete() record with id=${id}.`));
      };
    });

    await transactionFinished;

    return ok(undefined);
  } catch (error) {
    return err(new StorageError(`Failed to delete record with id=${id}`, error));
  }
}
