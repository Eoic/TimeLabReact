import { StorageError } from './errors';
import { type Result, ok, err } from '../shared/result';

export type IDBRecord = Record<string, unknown> & { id: string };

const DB_VERSION = 1;
const DB_NAME = 'timelab';
export const STORE_PROJECTS = 'projects';

export function makeOpenDatabase(
  factory: IDBFactory,
  name: string,
  version: number,
  stores: string[],
): () => Promise<IDBDatabase> {
  return () => {
    return new Promise((resolve, reject) => {
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
        reject(request.error ?? new Error(`Failed to open the database`));
      };
    });
  };
}

function _openDatabase() {
  return makeOpenDatabase(globalThis.indexedDB, DB_NAME, DB_VERSION, [STORE_PROJECTS])();
}

function _ensureStoreExists(database: IDBDatabase, storeName: string): Result<void, StorageError> {
  if (database.objectStoreNames.contains(storeName)) {
    return ok(undefined);
  }

  const errorMessage = [
    `Object store '${storeName}' was not found!`,
    `Available stores: ${Array.from(database.objectStoreNames).join(', ')}`,
    `Database version: ${database.version}`,
  ].join('\n');

  return err(new StorageError(errorMessage));
}

async function _fetch<T>(
  database: IDBDatabase,
  storeName: string,
  storeAction: string,
  storeRequest: (store: IDBObjectStore) => IDBRequest,
) {
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
    const result = await _fetch<T>(database, storeName, 'getRecord()', (store) => store.get(id));

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

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = storeAction(store, record);

      request.onsuccess = (): void => {
        resolve();
      };

      request.onerror = (): void => {
        reject(request.error ?? new Error('Failed to perform action'));
      };
    });

    return ok(record);
  } catch (error) {
    return err(new StorageError('Failed to save record', error));
  }
}

export async function insertRecord<T extends IDBRecord>(record: T, storeName: string) {
  return await _saveRecord(record, storeName, (store, record) => store.add(record));
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

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = (): void => {
        resolve();
      };

      request.onerror = (): void => {
        reject(request.error ?? new Error(`Failed to delete() record with id=${id}'`));
      };
    });

    return ok(undefined);
  } catch (error) {
    return err(new StorageError(`Failed to delete record with id=${id}`, error));
  }
}
