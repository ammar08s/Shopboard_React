import type { DraftValidation, ProductFormValues } from './admin.products.types.ts';

/** Validates admin fields and converts a decimal USD price into integer cents.
 * @param values - Raw values from the product form.
 * @returns A normalized draft, or a message describing the invalid input.
 */
export function validateProductDraft(values: ProductFormValues): DraftValidation {
  const title = values.title.trim();
  const category = values.category.trim();
  if (title.length === 0 || title.length > 120)
    return { success: false, message: 'Enter a product name between 1 and 120 characters.' };
  if (category.length === 0 || category.length > 60)
    return { success: false, message: 'Enter a category between 1 and 60 characters.' };

  const price = values.price.trim();
  const priceCents = Math.round(Number(price) * 100);
  if (
    !/^\d+(\.\d{1,2})?$/.test(price) ||
    !Number.isSafeInteger(priceCents) ||
    priceCents > 100_000_000
  )
    return {
      success: false,
      message: 'Enter a USD price from 0 to 1,000,000 with at most two decimal places.',
    };

  return { success: true, product: { title, category, priceCents, inStock: values.inStock } };
}
