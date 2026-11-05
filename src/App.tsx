import type { ReactElement } from 'react';
import { StoreHeader } from './app/StoreHeader.tsx';
import { Products } from './features/products/Products.tsx';
import './shared/styles/global.css';
import './App.css';

interface Props {
  children?: never;
}

/** Composes the initial storefront. @param props - No configurable inputs. @returns Store application. */
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
          <section className="store-intro">
            <div>
              <p className="products-eyebrow">THE EVERYDAY COLLECTION / 001</p>
              <h1>
                Find your
                <br />
                <em>everyday good.</em>
              </h1>
              <p className="store-description">
                Bags, shoes, and the little things that bring it all together.
                <br />
                Discover your next everyday essential.
              </p>
            </div>
            <div className="store-intro-note">
              <span aria-hidden="true">✳</span>
              <p>
                Thoughtfully selected.
                <br />
                Simply discovered.
              </p>
            </div>
          </section>
          <div id="collection" className="store-collection-heading">
            <h2>
              The collection<span>.</span>
            </h2>
            <span>YOUR NEXT GOOD FIND STARTS HERE</span>
          </div>
          <Products />
        </main>
        <footer className="store-footer">
          <span>shopboard®</span>
          <p>A considered collection for everyday living.</p>
          <a href="#">Back to top ↑</a>
        </footer>
      </div>
    </>
  );
}

export default App;
