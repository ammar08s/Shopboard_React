export interface Product {
  id: number;
  title: string;
  category: string;
  priceCents: number;
  inStock: boolean;
}

export type SortOrder = 'name' | 'price-asc' | 'price-desc';

export interface ProductFilters {
  query: string;
  category: string;
  stockOnly: boolean;
  sort: SortOrder;
}
