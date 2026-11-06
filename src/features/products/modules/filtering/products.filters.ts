import type { Product } from '../catalog/products.types.ts';
import type { ProductFilters } from './products.filters.types.ts';

export const initialProductFilters: Readonly<ProductFilters> = {
  query: '',
  category: '',
  stockOnly: false,
  sort: 'name',
};

/**
 * Derives the unique category options without changing the catalog.
 * @param products - Validated catalog.
 * @returns Distinct category names in alphabetical order.
 */
export function getProductCategories(products: Product[]): string[] {
  /** Reads a product category. @param product - Catalog item. @returns Its category name. */
  function categoryOf(product: Product): string {
    return product.category;
  }
  return [...new Set(products.map(categoryOf))].sort();
}

/**
 * Validates a sort selection and applies it without changing existing filters.
 * @param filters - Current filter choices.
 * @param value - Unvalidated sort selection.
 * @returns Updated filters, or the current filters when the value is unsupported.
 */
export function updateProductSort(filters: ProductFilters, value: string): ProductFilters {
  if (value === 'name' || value === 'price-asc' || value === 'price-desc') {
    return { ...filters, sort: value };
  }
  return filters;
}

/** Selects matching products without changing source data. @param products - Catalog. @param filters - Search, filters, and ordering. @returns Sorted matches. */
export function selectProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.query.trim().toLowerCase();
  /** Checks all active filters. @param product - Candidate. @returns Whether it matches. */
  function matches(product: Product): boolean {
    return (
      product.title.toLowerCase().includes(query) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.stockOnly || product.inStock)
    );
  }
  /** Compares selected products. @param first - First product. @param second - Second product. @returns Sort comparison. */
  function compare(first: Product, second: Product): number {
    if (filters.sort === 'price-asc') return first.priceCents - second.priceCents;
    if (filters.sort === 'price-desc') return second.priceCents - first.priceCents;
    return first.title.localeCompare(second.title);
  }
  return products.filter(matches).sort(compare);
}
