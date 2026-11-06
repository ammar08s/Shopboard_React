import type { ReactElement } from 'react';
import { Products } from '../features/products/components/Products/Products.tsx';
import { StoreFooter } from './components/StoreFooter/StoreFooter.tsx';
import { StoreHeader } from './components/StoreHeader/StoreHeader.tsx';
import { StoreIntro } from './components/StoreIntro/StoreIntro.tsx';
import './App.css';

interface Props {
  children?: never;
}

/**
 * Composes the storefront shell and product feature.
 * @param props - No configurable inputs.
 * @returns Store application.
 */
function App(_props: Props): ReactElement {
  return (
    <>
      <a className="store-skip" href="#collection">
        Skip to products
      </a>
      <div className="store-announcement">Good things. Everyday essentials. All in one place.</div>
      <div className="store-shell">
        <StoreHeader />
        <main>
          <StoreIntro />
          <div id="collection" className="store-collection-heading">
            <h2>
              The collection<span>.</span>
            </h2>
            <span>YOUR NEXT GOOD FIND STARTS HERE</span>
          </div>
          <Products />
        </main>
        <StoreFooter />
      </div>
    </>
  );
}

export default App;
