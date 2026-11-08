import { useRef, useState } from 'react';
import type { Notify } from '../../../../shared/modules/toasts/toasts.types.ts';
import type { Product } from '../catalog/products.types.ts';
import {
  applyDemoChanges,
  createDemoProduct,
  updateDemoProduct,
  deleteDemoProduct,
  deleteDemoCategory,
} from './products.demo.ts';
import type { DemoChanges, ProductDraft } from './products.demo.ts';
import { readDemoCatalog, saveDemoCatalog } from './products.storage.ts';
import type { StoredCatalog } from './products.storage.ts';

interface DemoCatalog {
  products: Product[];
  storageError: string | null;
  createProduct: (draft: ProductDraft) => void;
  updateProduct: (id: number, draft: ProductDraft) => void;
  deleteProduct: (id: number) => void;
  deleteCategory: (category: string, replacement: string) => void;
}

/** Reads the initial catalog and tolerates browsers that deny access to the storage object. No inputs.
 * @returns Restored changes or a recoverable empty local catalog.
 */
function loadInitialCatalog(): StoredCatalog {
  try {
    return readDemoCatalog(window.localStorage);
  } catch {
    return {
      changes: { products: [], deletedIds: [] },
      storageError: 'Browser storage is unavailable. Demo changes will be lost after refresh.',
    };
  }
}

/** Owns local catalog edits and derives the catalog shared by storefront and dashboard.
 * @param baseProducts - Validated read-only API products, or an empty list while unavailable.
 * @param notify - Application notification callback for mutation and persistence outcomes.
 * @returns Merged products, persistence feedback, and browser-only mutation actions.
 */
export function useDemoCatalog(baseProducts: Product[], notify: Notify): DemoCatalog {
  const [catalog, setCatalog] = useState(loadInitialCatalog);
  const latestChanges = useRef(catalog.changes);

  /** Saves a user-triggered local mutation and its persistence result.
   * @param changes - Next local changes.
   * @param message - Description of the completed local mutation.
   * @returns Nothing; updates storage and React state while keeping storage errors recoverable.
   */
  function commitChanges(changes: DemoChanges, message: string): void {
    let storageError: string | null;
    try {
      storageError = saveDemoCatalog(window.localStorage, changes);
    } catch {
      storageError = 'Browser storage is unavailable. Demo changes will be lost after refresh.';
    }
    latestChanges.current = changes;
    setCatalog({ changes, storageError });
    notify({
      variant: storageError === null ? 'success' : 'error',
      message: storageError === null ? message : `${message} ${storageError}`,
    });
  }

  /** Adds a locally generated product.
   * @param draft - Validated product fields.
   * @returns Nothing; updates catalog state.
   */
  function createProduct(draft: ProductDraft): void {
    commitChanges(
      createDemoProduct(latestChanges.current, draft),
      `${draft.title} created in ${draft.category}.`,
    );
  }

  /** Updates a product locally.
   * @param id - Existing product ID.
   * @param draft - Validated replacement fields.
   * @returns Nothing; updates catalog state.
   */
  function updateProduct(id: number, draft: ProductDraft): void {
    commitChanges(updateDemoProduct(latestChanges.current, id, draft), `${draft.title} updated.`);
  }

  /** Deletes a product locally.
   * @param id - Product ID to hide.
   * @returns Nothing; updates catalog state.
   */
  function deleteProduct(id: number): void {
    let title = 'Product';
    for (const product of applyDemoChanges(baseProducts, latestChanges.current)) {
      if (product.id === id) {
        title = product.title;
        break;
      }
    }
    commitChanges(
      deleteDemoProduct(latestChanges.current, id),
      `${title} deleted from your demo collection.`,
    );
  }

  /** Deletes a category locally while keeping its products under a replacement category.
   * @param category - Category to remove.
   * @param replacement - Validated replacement category name.
   * @returns Nothing; saves one atomic catalog change and updates the storefront.
   */
  function deleteCategory(category: string, replacement: string): void {
    commitChanges(
      deleteDemoCategory(baseProducts, latestChanges.current, category, replacement),
      `${category} deleted. Its products now belong to ${replacement}.`,
    );
  }

  return {
    products: applyDemoChanges(baseProducts, catalog.changes),
    storageError: catalog.storageError,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteCategory,
  };
}
