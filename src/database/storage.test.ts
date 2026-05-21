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
import type { Err, Ok } from '../shared/result';
import { type Project } from './entities';

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

    const saveResult = await insertRecord(record, STORE_PROJECTS);
    const recordResult = await getRecord<Project>(record.id, STORE_PROJECTS);
    const recordsResult = await getAllRecords<Project>(STORE_PROJECTS);

    expect(saveResult.ok).toBe(true);

    if (!recordResult.ok) {
      throw recordResult.error;
    }

    expect(recordResult.value).toEqual(record);

    if (!recordsResult.ok) {
      throw recordsResult.error;
    }

    expect(recordsResult.value).toEqual([record]);
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

    const saveResult = await insertRecord(record, STORE_PROJECTS);
    const deleteResult = await deleteRecord(record.id, STORE_PROJECTS);
    const recordsResult = await getAllRecords<Project>(STORE_PROJECTS);

    expect(saveResult.ok).toBe(true);
    expect(deleteResult.ok).toBe(true);

    if (!recordsResult.ok) {
      throw recordsResult.error;
    }

    expect(recordsResult.value).toEqual([]);
  });

  it('returns an error when saving to an unknown store', async () => {
    const result = await insertRecord({ id: 'project-1' }, 'missing-store');

    expect(result.ok).toBeFalsy();
    expect((result as Err).error.name).toBe('StorageError');
    expect((result as Err).error.message).toContain("Object store 'missing-store' was not found!");
  });

  it('returns an error when getting a single record from unknown store', async () => {
    const result = await getRecord<Project>('project-1', 'some-store-1');

    expect(result.ok).toBeFalsy();
    expect((result as Err).error.name).toBe('StorageError');
    expect((result as Err).error.message).toContain('Failed to retrieve record');
  });

  it('returns ok with undefined when the record does not exist', async () => {
    const result = await getRecord<Project>('missing-id', STORE_PROJECTS);

    expect(result.ok).toBe(true);
    expect((result as Ok<Project | null>).value).toBeNull();
  });

  it('successive calls to known store do not fail', async () => {
    const resultA = await getRecord<Project>('missing-id', STORE_PROJECTS);
    const resultB = await getRecord<Project>('missing-id', STORE_PROJECTS);
    const resultC = await getRecord<Project>('missing-id', STORE_PROJECTS);
    const results = [resultA, resultB, resultC];

    for (const result of results) {
      expect(result.ok).toBe(true);
      expect((result as Ok<Project | null>).value).toBe(null);
    }
  });

  it('returns an error when getAll request fails', async () => {
    vi.spyOn(FakeIDBObjectStore.prototype, 'getAll').mockImplementation(() => makeFailingRequest(null));

    const result = await getAllRecords<Project>(STORE_PROJECTS);

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Expected getAllRecords to fail.');
    }

    expect(result.error.name).toBe('StorageError');
    expect(result.error.message).toBe('Failed to retrieve records');
    expect(result.error.cause).toEqual(new Error(`Failed to getAllRecords() from ${STORE_PROJECTS}.`));
  });

  it('returns an error when add request fails while saving', async () => {
    vi.spyOn(FakeIDBObjectStore.prototype, 'add').mockImplementation(() => makeFailingRequest(null));
    vi.spyOn(FakeIDBObjectStore.prototype, 'put').mockImplementation(() => makeFailingRequest(null));

    const resultInsert = await insertRecord({ id: 'project-1' }, STORE_PROJECTS);
    const resultUpdate = await updateRecord({ id: 'project-1' }, STORE_PROJECTS);

    expect(resultInsert.ok).toBe(false);
    expect(resultUpdate.ok).toBe(false);

    if (resultInsert.ok) {
      throw new Error('Expected insertRecord to fail.');
    }

    if (resultUpdate.ok) {
      throw new Error('Expected updateRecord to fail.');
    }

    expect(resultInsert.error.name).toBe('StorageError');
    expect(resultInsert.error.message).toContain('Failed to save record');
    expect(resultInsert.error.cause).toEqual(new Error('Failed to perform action'));

    expect(resultUpdate.error.name).toBe('StorageError');
    expect(resultUpdate.error.message).toContain("Record doesn't exist");
    expect(resultUpdate.error.cause).toEqual('Not found');
  });

  it('returns an error when delete request fails', async () => {
    vi.spyOn(FakeIDBObjectStore.prototype, 'delete').mockImplementation(() => makeFailingRequest(null));

    const result = await deleteRecord('project-1', STORE_PROJECTS);

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Expected deleteRecord to fail.');
    }

    expect(result.error.name).toBe('StorageError');
    expect(result.error.message).toBe('Failed to delete record with id=project-1');
    expect(result.error.cause).toEqual(new Error("Failed to delete() record with id=project-1'"));
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
