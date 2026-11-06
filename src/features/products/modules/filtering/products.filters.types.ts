export type SortOrder = 'name' | 'price-asc' | 'price-desc';

export interface ProductFilters {
  query: string;
  category: string;
  stockOnly: boolean;
  sort: SortOrder;
}
