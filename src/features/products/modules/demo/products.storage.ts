import { parseDemoChanges } from './products.demo.ts';
import type { DemoChanges } from './products.demo.ts';

const STORAGE_KEY = 'shopboard.catalog.v1';

export interface StoredCatalog {
  changes: DemoChanges;
  storageError: string | null;
}

/** Restores local changes and recovers safely from malformed or blocked browser storage.
 * @param storage - Browser-compatible storage reader.
 * @returns Valid local changes and a recoverable storage message when needed.
 */
export function readDemoCatalog(storage: Pick<Storage, 'getItem'>): StoredCatalog {
  try {
    return { changes: parseDemoChanges(storage.getItem(STORAGE_KEY)), storageError: null };
  } catch {
    return {
      changes: { products: [], deletedIds: [] },
      storageError:
        'Saved demo changes could not be restored. New changes will be kept for this visit if browser storage is unavailable.',
    };
  }
}

/** Persists local catalog changes without issuing any API request.
 * @param storage - Browser-compatible storage writer.
 * @param changes - Validated changes to save.
 * @returns An error message if the browser refuses persistence, otherwise null.
 */
export function saveDemoCatalog(
  storage: Pick<Storage, 'setItem'>,
  changes: DemoChanges,
): string | null {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...changes }));
    return null;
  } catch {
    return 'Browser storage is unavailable. Demo changes will be lost after refresh.';
  }
}
