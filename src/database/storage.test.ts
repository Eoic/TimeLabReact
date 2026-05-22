import { IDBFactory, IDBObjectStore as FakeIDBObjectStore } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteRecord,
  getAllRecords,
  getRecord,
  makeOpenDatabase,
  insertRecord,
  updateRecord,
  STORE_PROJECTS,
} from './storage';
import { type Project } from './entities';
import { unwrapErr, unwrapOk } from '../shared/result';

function makeFailingRequest(error: DOMException | null): IDBRequest {
  const request = {
    error,
    onerror: null,
    onsuccess: null,
    result: undefined,
  } as unknown as IDBRequest;

  queueMicrotask(() => {
    request.onerror?.call(request, new Event('error'));
  });

  return request;
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: new IDBFactory(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('storage', () => {
  it('saves and reads records from IndexedDB', async () => {
    const record: Project = {
      id: 'project-1',
      title: 'Client work',
      description: 'An example description',
      createdAt: Date.now(),
      updatedAt: null,
      isArchived: false,
      isDefault: true,
    };

    unwrapOk(await insertRecord(record, STORE_PROJECTS));
    const storedRecord = unwrapOk(await getRecord<Project>(record.id, STORE_PROJECTS));
    const records = unwrapOk(await getAllRecords<Project>(STORE_PROJECTS));

    expect(storedRecord).toEqual(record);
    expect(records).toEqual([record]);
  });

  it('deletes records from IndexedDB', async () => {
    const record: Project = {
      id: 'project-1111',
      title: 'Client work',
      description: 'An example description',
      createdAt: Date.now(),
      updatedAt: null,
      isArchived: false,
      isDefault: true,
    };

    unwrapOk(await insertRecord(record, STORE_PROJECTS));
    unwrapOk(await deleteRecord(record.id, STORE_PROJECTS));
    const records = unwrapOk(await getAllRecords<Project>(STORE_PROJECTS));

    expect(records).toEqual([]);
  });

  it('returns an error when saving to an unknown store', async () => {
    const error = unwrapErr(await insertRecord({ id: 'project-1' }, 'missing-store'));

    expect(error.name).toBe('StorageError');
    expect(error.message).toContain("Object store 'missing-store' was not found!");
  });

  it('returns an error when getting a single record from unknown store', async () => {
    const error = unwrapErr(await getRecord<Project>('project-1', 'some-store-1'));

    expect(error.name).toBe('StorageError');
    expect(error.message).toContain('Failed to retrieve record');
  });

  it('returns err when the record does not exist', async () => {
    expect(unwrapErr(await getRecord<Project>('missing-id', STORE_PROJECTS)).name).toBe('StorageError');
  });

  it('successive calls to known store do not fail', async () => {
    const resultA = await getRecord<Project>('missing-id', STORE_PROJECTS);
    const resultB = await getRecord<Project>('missing-id', STORE_PROJECTS);
    const resultC = await getRecord<Project>('missing-id', STORE_PROJECTS);
    const results = [resultA, resultB, resultC];

    for (const result of results) {
      expect(unwrapErr(result).name).toBe('StorageError');
    }
  });

  it('returns an error when getAll request fails', async () => {
    vi.spyOn(FakeIDBObjectStore.prototype, 'getAll').mockImplementation(() => makeFailingRequest(null));

    const error = unwrapErr(await getAllRecords<Project>(STORE_PROJECTS));

    expect(error.name).toBe('StorageError');
    expect(error.message).toBe('Failed to retrieve records');
    expect(error.cause).toEqual(new Error(`Failed to getAllRecords() from ${STORE_PROJECTS}.`));
  });

  it('returns an error when add request fails while saving', async () => {
    vi.spyOn(FakeIDBObjectStore.prototype, 'add').mockImplementation(() => makeFailingRequest(null));
    vi.spyOn(FakeIDBObjectStore.prototype, 'put').mockImplementation(() => makeFailingRequest(null));

    const insertError = unwrapErr(await insertRecord({ id: 'project-1' }, STORE_PROJECTS));
    const updateError = unwrapErr(await updateRecord({ id: 'project-1' }, STORE_PROJECTS));

    expect(insertError.name).toBe('StorageError');
    expect(insertError.message).toContain('Failed to save record');
    expect(insertError.cause).toEqual(new Error('Failed to perform action'));

    expect(updateError.name).toBe('StorageError');
    expect(updateError.message).toContain('Failed to acquire existing record');
  });

  it('returns an error when delete request fails', async () => {
    vi.spyOn(FakeIDBObjectStore.prototype, 'delete').mockImplementation(() => makeFailingRequest(null));

    const error = unwrapErr(await deleteRecord('project-1', STORE_PROJECTS));

    expect(error.name).toBe('StorageError');
    expect(error.message).toBe('Failed to delete record with id=project-1');
    expect(error.cause).toEqual(new Error("Failed to delete() record with id=project-1'"));
  });
});

describe('storage utils', () => {
  it('returns the request error when IndexedDB open request fails', async () => {
    const openError = new DOMException('open failed', 'UnknownError');

    const request = {
      error: openError,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
    } as unknown as IDBOpenDBRequest;

    const factory = {
      open: vi.fn(() => {
        queueMicrotask(() => {
          request.onerror?.call(request, new Event('error'));
        });

        return request;
      }),
    } as unknown as IDBFactory;

    const openDatabase = makeOpenDatabase(factory, 'timelab', 1, [STORE_PROJECTS]);

    await expect(openDatabase()).rejects.toBe(openError);
  });

  it('returns a fallback error when IndexedDB open request fails without an error', async () => {
    const request = {
      error: null,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
    } as unknown as IDBOpenDBRequest;

    const factory = {
      open: vi.fn(() => {
        queueMicrotask(() => {
          request.onerror?.call(request, new Event('error'));
        });

        return request;
      }),
    } as unknown as IDBFactory;

    const openDatabase = makeOpenDatabase(factory, 'timelab', 1, [STORE_PROJECTS]);

    await expect(openDatabase()).rejects.toEqual(new Error('Failed to open the database'));
  });

  it('database can be upgraded successfully', async () => {
    const stores = ['store-one', 'store-two', 'store-three'];

    for (let i = 1; i < 5; i++) {
      const openDatabase = makeOpenDatabase(indexedDB, 'timelab', i, stores);
      const database = await openDatabase();
      expect(database.version).toBe(i);
      database.close();
    }
  });
});
