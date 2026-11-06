import { useState, type ReactElement } from 'react';
import type { Product } from '../../../modules/catalog/products.types.ts';
import { formatPrice } from '../../../modules/pricing/products.price.ts';

import './ProductCard.css';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

/** Displays a product and its cart action. @param props - Product to display and cart addition callback. @returns Product card. */
export function ProductCard({ product, onAddToCart }: Props): ReactElement {
  const [hasAdded, setHasAdded] = useState(false);

  /** Adds the available product and displays feedback. No inputs. @returns Nothing. */
  function addToCart(): void {
    if (!product.inStock) return;
    onAddToCart(product);
    setHasAdded(true);
  }

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
        <button
          className="products-add-to-cart"
          type="button"
          onClick={addToCart}
          disabled={!product.inStock}
          aria-label={`Add ${product.title} to cart`}
        >
          {product.inStock ? 'Add to cart' : 'Unavailable'}
          {product.inStock ? <span aria-hidden="true">+</span> : null}
        </button>
        <p className="products-cart-feedback" role="status">
          {hasAdded ? (
            <>
              In your cart. <a href="#cart">View cart</a>
            </>
          ) : null}
        </p>
      </div>
    </article>
  );
}
