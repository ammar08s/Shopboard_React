import type { AdminProduct } from './admin.products.types.ts';

/** Derives sorted category choices from the current API and local demo products.
 * @param products - Current collection, which remains unchanged.
 * @returns Nonblank category names, deduplicated without casing or surrounding spaces.
 */
export function getAdminCategories(products: AdminProduct[]): string[] {
  const categories = new Map<string, string>();
  for (const product of products) {
    const category = product.category.trim();
    const key = category.toLowerCase();
    if (category !== '' && !categories.has(key)) categories.set(key, category);
  }

  /** Orders category names for the dropdown.
   * @param first - First category.
   * @param second - Second category.
   * @returns Alphabetical comparison result.
   */
  function compareCategories(first: string, second: string): number {
    return first.localeCompare(second);
  }
  return Array.from(categories.values()).sort(compareCategories);
}

/** Reuses an existing category's spelling or prepares a new name for draft validation.
 * @param name - Entered or currently assigned category name.
 * @param categories - Available category names.
 * @returns Matching existing category or the trimmed new name; blank input stays blank.
 */
export function resolveCategoryName(name: string, categories: string[]): string {
  const trimmed = name.trim();
  const normalized = trimmed.toLowerCase();
  /** Checks for an existing category with the same normalized name.
   * @param category - Existing category name.
   * @returns Whether the category matches the entered name.
   */
  function matchesCategory(category: string): boolean {
    return category.toLowerCase() === normalized;
  }
  return categories.find(matchesCategory) ?? trimmed;
}
