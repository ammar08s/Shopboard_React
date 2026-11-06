import type { ReactElement } from 'react';
import type { Product } from '../../modules/catalog/products.types.ts';
import { useProductFilters } from '../../modules/filtering/useProductFilters.ts';
import { ProductEmptyState } from '../ProductEmptyState/ProductEmptyState.tsx';
import { ProductFilters } from '../ProductFilters/ProductFilters.tsx';
import { ProductGrid } from '../ProductGrid/ProductGrid.tsx';
import { ProductToolbar } from '../ProductToolbar/ProductToolbar.tsx';
import './ProductCatalog.css';

interface Props {
  products: Product[];
}

/**
 * Composes catalog filters, sorting, and matching product results.
 * @param props - Loaded catalog.
 * @returns Interactive product browsing with feedback for empty results.
 */
export function ProductCatalog({ products }: Props): ReactElement {
  const { filters, categories, visibleProducts, setFilters, resetFilters, changeSort } =
    useProductFilters(products);

  return (
    <div className="products-layout">
      <ProductFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onReset={resetFilters}
      />
      <section className="products-results" aria-label="Products">
        <ProductToolbar
          matchingCount={visibleProducts.length}
          totalCount={products.length}
          sort={filters.sort}
          onSortChange={changeSort}
        />
        {visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} />
        ) : (
          <ProductEmptyState totalCount={products.length} onReset={resetFilters} />
        )}
      </section>
    </div>
  );
}
