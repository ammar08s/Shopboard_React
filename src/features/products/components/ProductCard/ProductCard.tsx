import type { ReactElement } from 'react';
import { formatPrice } from '../../modules/pricing/products.price.ts';
import type { Product } from '../../modules/catalog/products.types.ts';

import './ProductCard.css';

interface Props {
  product: Product;
}

/** Displays a product's catalog information. @param props - Product to display. @returns Product card. */
export function ProductCard({ product }: Props): ReactElement {
  return (
    <article className="products-card">
      <div
        className={`products-art products-art-${product.category.toLowerCase()}`}
        aria-hidden="true"
      >
        <span className="products-art-word">{product.category}</span>
        <span className="products-monogram">{product.title.charAt(0)}</span>
        <span className="products-art-number">N° {String(product.id).padStart(2, '0')}</span>
      </div>
      <div className="products-card-body">
        <div className="products-card-meta">
          <span>{product.category}</span>
          <span
            className={product.inStock ? 'products-stock' : 'products-stock products-stock-out'}
          >
            {product.inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>
        <h3>{product.title}</h3>
        <p className="products-price">
          {formatPrice(product.priceCents)} <span>USD</span>
        </p>
      </div>
    </article>
  );
}
