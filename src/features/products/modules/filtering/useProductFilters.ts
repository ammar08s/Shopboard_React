import { useState } from 'react';
import type { Product } from '../catalog/products.types.ts';
import {
  getProductCategories,
  initialProductFilters,
  selectProducts,
  updateProductSort,
} from './products.filters.ts';
import type { ProductFilters } from './products.filters.types.ts';

interface ProductFilterState {
  filters: ProductFilters;
  categories: string[];
  visibleProducts: Product[];
  setFilters: (filters: ProductFilters) => void;
  resetFilters: () => void;
  changeSort: (value: string) => void;
}

/**
 * Owns catalog filter choices and derives matching products and category options.
 * @param products - Loaded, validated catalog.
 * @returns Filter values, derived results, and actions to change or reset choices.
 */
export function useProductFilters(products: Product[]): ProductFilterState {
  const [filters, setFilters] = useState<ProductFilters>(initialProductFilters);

  /**
   * Restores all filter defaults. No inputs.
   * @returns Nothing; updates local filter state.
   */
  function resetFilters(): void {
    setFilters(initialProductFilters);
  }

  /**
   * Applies a supported sort value while preserving other filter choices.
   * @param value - Sort value selected by the user.
   * @returns Nothing; updates filter state for supported sort values.
   */
  function changeSort(value: string): void {
    /**
     * Applies the selection to the latest filter state.
     * @param currentFilters - Latest filter choices.
     * @returns Updated filters, or the existing filters for an unsupported value.
     */
    function applySort(currentFilters: ProductFilters): ProductFilters {
      return updateProductSort(currentFilters, value);
    }
    setFilters(applySort);
  }

  return {
    filters,
    categories: getProductCategories(products),
    visibleProducts: selectProducts(products, filters),
    setFilters,
    resetFilters,
    changeSort,
  };
}
