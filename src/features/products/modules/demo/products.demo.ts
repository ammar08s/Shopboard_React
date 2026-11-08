import type { Product } from '../catalog/products.types.ts';

export type ProductDraft = Omit<Product, 'id'>;

export interface DemoChanges {
  products: Product[];
  deletedIds: number[];
}

/** Merges local replacements and additions with the remote catalog.
 * @param products - Validated API catalog.
 * @param changes - Browser-only edits and deleted IDs.
 * @returns A new catalog without changing API data or stored changes.
 */
export function applyDemoChanges(products: Product[], changes: DemoChanges): Product[] {
  const merged = new Map<number, Product>();
  for (const product of products) merged.set(product.id, product);
  for (const product of changes.products) merged.set(product.id, product);
  for (const id of changes.deletedIds) merged.delete(id);
  return Array.from(merged.values());
}

/** Adds a browser-only product using a distinct negative ID.
 * @param changes - Current local changes.
 * @param draft - Validated product fields.
 * @returns Updated changes with a never-reused demo ID.
 */
export function createDemoProduct(changes: DemoChanges, draft: ProductDraft): DemoChanges {
  let nextId = -1;
  for (const product of changes.products) nextId = Math.min(nextId, product.id - 1);
  for (const id of changes.deletedIds) nextId = Math.min(nextId, id - 1);
  return { ...changes, products: [...changes.products, { ...draft, id: nextId }] };
}

/** Replaces a product's local fields without altering the external catalog.
 * @param changes - Current local changes.
 * @param id - Existing product ID.
 * @param draft - Validated replacement fields.
 * @returns Updated local replacements.
 */
export function updateDemoProduct(
  changes: DemoChanges,
  id: number,
  draft: ProductDraft,
): DemoChanges {
  /** Keeps replacements for other products.
   * @param product - Stored replacement.
   * @returns Whether it belongs to another product.
   */
  function otherProduct(product: Product): boolean {
    return product.id !== id;
  }
  return { ...changes, products: [...changes.products.filter(otherProduct), { ...draft, id }] };
}

/** Hides an API or demo product locally while retaining its ID to avoid reuse.
 * @param changes - Current local changes.
 * @param id - Product to remove.
 * @returns Changes that exclude the product from the merged catalog.
 */
export function deleteDemoProduct(changes: DemoChanges, id: number): DemoChanges {
  /** Keeps replacements for products that were not deleted.
   * @param product - Stored replacement.
   * @returns Whether this replacement should remain.
   */
  function keepProduct(product: Product): boolean {
    return product.id !== id;
  }
  return {
    products: changes.products.filter(keepProduct),
    deletedIds: Array.from(new Set([...changes.deletedIds, id])),
  };
}

/** Removes a local category by moving its products in one persistent catalog change.
 * @param products - Current read-only API catalog.
 * @param changes - Latest local edits, additions, and deletions.
 * @param category - Category to remove, matched without casing or surrounding spaces.
 * @param replacement - Validated destination category name.
 * @returns Updated local replacements; preserves all product fields and ignores invalid moves.
 */
export function deleteDemoCategory(
  products: Product[],
  changes: DemoChanges,
  category: string,
  replacement: string,
): DemoChanges {
  const source = category.trim().toLowerCase();
  const destination = replacement.trim();
  if (
    source === '' ||
    destination === '' ||
    destination.length > 60 ||
    source === destination.toLowerCase()
  )
    return changes;

  const replacements = new Map<number, Product>();
  for (const product of changes.products) replacements.set(product.id, product);
  let moved = false;
  for (const product of applyDemoChanges(products, changes)) {
    if (product.category.trim().toLowerCase() !== source) continue;
    replacements.set(product.id, { ...product, category: destination });
    moved = true;
  }
  return moved ? { ...changes, products: Array.from(replacements.values()) } : changes;
}

/** Checks a saved frontend product before trusting browser storage.
 * @param value - Unknown stored product.
 * @returns Whether all product fields are valid.
 */
function isSavedProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    'title' in value &&
    typeof value.title === 'string' &&
    'category' in value &&
    typeof value.category === 'string' &&
    'priceCents' in value &&
    typeof value.priceCents === 'number' &&
    Number.isSafeInteger(value.priceCents) &&
    value.priceCents >= 0 &&
    'inStock' in value &&
    typeof value.inStock === 'boolean'
  );
}

/** Validates the version and contents of persisted catalog changes.
 * @param raw - Saved JSON, or null for a fresh browser.
 * @returns Validated local changes.
 * @throws Error when saved data is malformed or from another version.
 */
export function parseDemoChanges(raw: string | null): DemoChanges {
  if (raw === null) return { products: [], deletedIds: [] };
  const value: unknown = JSON.parse(raw);
  if (
    typeof value !== 'object' ||
    value === null ||
    !('version' in value) ||
    value.version !== 1 ||
    !('products' in value) ||
    !Array.isArray(value.products) ||
    !('deletedIds' in value) ||
    !Array.isArray(value.deletedIds)
  )
    throw new Error('Invalid saved demo catalog.');

  const products: Product[] = [];
  const deletedIds: number[] = [];
  const seenIds = new Set<number>();
  for (const product of value.products) {
    if (!isSavedProduct(product) || seenIds.has(product.id))
      throw new Error('Invalid saved demo product.');
    seenIds.add(product.id);
    products.push(product);
  }
  for (const id of value.deletedIds) {
    if (typeof id !== 'number' || !Number.isSafeInteger(id))
      throw new Error('Invalid deleted product ID.');
    deletedIds.push(id);
  }
  return { products, deletedIds };
}
