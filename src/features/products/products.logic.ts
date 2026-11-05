import type { Product, ProductFilters } from './products.types.ts';

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

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
/** Formats an integer minor-unit price. @param cents - Price in cents. @returns USD display price. */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}
