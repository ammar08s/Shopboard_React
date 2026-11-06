import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDemoCatalog, saveDemoCatalog } from './products.storage.ts';

/** Checks saving and restoring local changes through the storage boundary. No inputs.
 * @returns Nothing.
 */
function persistsChanges(): void {
  const data = new Map<string, string>();
  /** Reads a saved value.
   * @param key - Storage key.
   * @returns The saved value, or null.
   */
  function getItem(key: string): string | null {
    return data.get(key) ?? null;
  }
  /** Writes a saved value.
   * @param key - Storage key.
   * @param value - JSON string.
   * @returns Nothing; updates test storage.
   */
  function setItem(key: string, value: string): void {
    data.set(key, value);
  }
  const storage = { getItem, setItem };
  const changes = {
    products: [{ id: -1, title: 'Cup', category: 'Home', priceCents: 99, inStock: true }],
    deletedIds: [2],
  };
  assert.equal(saveDemoCatalog(storage, changes), null);
  assert.deepEqual(readDemoCatalog(storage), { changes, storageError: null });
}
test('restores demo product edits and deletions after a storage round trip', persistsChanges);

/** Checks denied and corrupt storage recovery. No inputs. @returns Nothing. */
function handlesFailedStorage(): void {
  /** Simulates unavailable browser storage. No inputs. @returns Nothing; throws storage denial. */
  function denied(): never {
    throw new Error('Storage denied');
  }
  /** Supplies a corrupt JSON value. No inputs. @returns Malformed saved JSON. */
  function corrupt(): string {
    return 'broken';
  }
  const restored = readDemoCatalog({ getItem: denied });
  assert.deepEqual(restored.changes, { products: [], deletedIds: [] });
  assert.ok(restored.storageError);
  assert.ok(readDemoCatalog({ getItem: corrupt }).storageError);
  assert.ok(saveDemoCatalog({ setItem: denied }, { products: [], deletedIds: [] }));
}
test(
  'recovers from corrupt or unavailable catalog storage with visible feedback',
  handlesFailedStorage,
);
