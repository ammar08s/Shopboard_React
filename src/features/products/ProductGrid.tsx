import type { ReactElement } from 'react';
import { ProductCard } from './ProductCard.tsx';
import type { Product } from './products.types.ts';

interface Props {
  products: Product[];
}

/** Renders matching catalog products. @param props - Matching products. @returns Product grid. */
export function ProductGrid({ products }: Props): ReactElement {
  /** Renders one keyed card. @param product - Product record. @returns Product card. */
  function renderProduct(product: Product): ReactElement {
    return <ProductCard key={product.id} product={product} />;
  }
  return <div className="products-grid">{products.map(renderProduct)}</div>;
}
