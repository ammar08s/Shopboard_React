import type { ReactElement } from 'react';
import './StoreIntro.css';

interface Props {
  children?: never;
}

/**
 * Introduces the store's everyday collection.
 * @param props - No configurable inputs.
 * @returns Storefront introduction and decorative collection note.
 */
export function StoreIntro(_props: Props): ReactElement {
  return (
    <section className="store-intro">
      <div>
        <p className="ui-eyebrow">THE EVERYDAY COLLECTION / 001</p>
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
  );
}
