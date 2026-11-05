import type { ReactElement } from 'react';
import { ProductCatalog } from './ProductCatalog.tsx';
import { useProducts } from './products.state.ts';
import './products.css';

interface Props {
  children?: never;
}

/** Connects catalog request state to its UI. @param props - No configurable inputs. @returns Catalog or request feedback. */
export function Products(_props: Props): ReactElement {
  const { state, retry } = useProducts();
  if (state.status === 'loading')
    return (
      <section className="products-message" role="status">
        <div className="products-loader" aria-hidden="true" />
        <h2>Good finds are on their way.</h2>
        <p>Loading the collection…</p>
      </section>
    );
  if (state.status === 'error')
    return (
      <section className="products-message" role="alert">
        <span className="products-eyebrow">A small interruption</span>
        <h2>We couldn’t load the collection.</h2>
        <p>{state.message}</p>
        <button className="products-button" type="button" onClick={retry}>
          Try again
        </button>
      </section>
    );
  return <ProductCatalog products={state.products} />;
}
