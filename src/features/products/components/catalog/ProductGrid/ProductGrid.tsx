import type { ReactElement } from 'react';
import type { Product } from '../../../modules/catalog/products.types.ts';
import { ProductCard } from '../ProductCard/ProductCard.tsx';

import './ProductGrid.css';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

/** Renders matching catalog products. @param props - Matching products and cart addition callback. @returns Product grid. */
export function ProductGrid({ products, onAddToCart }: Props): ReactElement {
  /** Renders one keyed card. @param product - Product record. @returns Product card. */
  function renderProduct(product: Product): ReactElement {
    return <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />;
  }
  return <div className="products-grid">{products.map(renderProduct)}</div>;
}
