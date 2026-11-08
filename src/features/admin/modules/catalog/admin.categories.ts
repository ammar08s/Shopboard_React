import type { AdminProduct } from './admin.products.types.ts';

type CategoryDeletionResult =
  { success: true; category: string; replacement: string } | { success: false; message: string };

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

/** Counts products using any normalized spelling of a category.
 * @param products - Current collection.
 * @param category - Category selected for deletion.
 * @returns Number of products that must move to a replacement category.
 */
export function getCategoryProductCount(products: AdminProduct[], category: string): number {
  const normalized = category.trim().toLowerCase();
  let count = 0;
  for (const product of products) {
    if (product.category.trim().toLowerCase() === normalized) count += 1;
  }
  return count;
}

/** Validates category deletion without discarding its products.
 * @param category - Category to remove.
 * @param replacement - Existing or new destination category.
 * @param categories - Current category choices.
 * @returns Canonical source/destination names or an actionable validation error.
 */
export function validateCategoryDeletion(
  category: string,
  replacement: string,
  categories: string[],
): CategoryDeletionResult {
  const source = resolveCategoryName(category, categories);
  if (!categories.includes(source))
    return {
      success: false,
      message: 'This category is no longer available. Choose another category.',
    };
  const destination = resolveCategoryName(replacement, categories);
  if (destination.length === 0 || destination.length > 60)
    return { success: false, message: 'Enter a replacement category between 1 and 60 characters.' };
  if (source.toLowerCase() === destination.toLowerCase())
    return { success: false, message: 'Choose a different category to move these products to.' };
  return { success: true, category: source, replacement: destination };
}

/** Reassigns a saved or currently selected category when it is deleted.
 * @param category - Saved or selected category to reconcile.
 * @param deletedCategory - Category being removed.
 * @param replacement - Validated replacement category.
 * @returns Replacement for matching names, otherwise the unchanged category.
 */
export function replaceDeletedCategory(
  category: string,
  deletedCategory: string,
  replacement: string,
): string {
  return category.trim().toLowerCase() === deletedCategory.trim().toLowerCase()
    ? replacement
    : category;
}
