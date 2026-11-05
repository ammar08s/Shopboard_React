import { useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import { ProductFilters } from './ProductFilters.tsx';
import { ProductGrid } from './ProductGrid.tsx';
import { selectProducts } from './products.logic.ts';
import type { Product, ProductFilters as Filters } from './products.types.ts';

interface Props {
  products: Product[];
}
const initialFilters: Filters = { query: '', category: '', stockOnly: false, sort: 'name' };

/** Provides interactive product browsing. @param props - Loaded catalog. @returns Searchable catalog. */
export function ProductCatalog({ products }: Props): ReactElement {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const visibleProducts = selectProducts(products, filters);
  /** Reads a category label. @param product - Catalog item. @returns Its category. */
  function categoryOf(product: Product): string {
    return product.category;
  }
  const categories = [...new Set(products.map(categoryOf))].sort();
  /** Clears all filter choices. No inputs. @returns Nothing. */
  function reset(): void {
    setFilters(initialFilters);
  }
  /** Updates the validated sort choice. @param event - Select change. @returns Nothing. */
  function changeSort(event: ChangeEvent<HTMLSelectElement>): void {
    const sort = event.target.value;
    if (sort === 'name' || sort === 'price-asc' || sort === 'price-desc')
      setFilters({ ...filters, sort });
  }
  return (
    <div className="products-layout">
      <ProductFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onReset={reset}
      />
      <section className="products-results" aria-label="Products">
        <div className="products-toolbar">
          <p aria-live="polite">
            <strong>{visibleProducts.length}</strong> of {products.length} products
          </p>
          <label>
            Sort by{' '}
            <select value={filters.sort} onChange={changeSort}>
              <option value="name">Name: A–Z</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
        {visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} />
        ) : (
          <div className="products-message">
            <span className="products-eyebrow">A fresh start</span>
            <h2>{products.length === 0 ? 'The shelves are quiet.' : 'No matches just yet.'}</h2>
            <p>
              {products.length === 0
                ? 'Check back soon for new products.'
                : 'Try another search or clear your filters to see the full collection.'}
            </p>
            {products.length > 0 ? (
              <button className="products-button" type="button" onClick={reset}>
                Clear filters
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
