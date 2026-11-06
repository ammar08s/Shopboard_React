import type { ReactElement } from 'react';

import './StoreHeader.css';

interface Props {
  children?: never;
}

/** Displays store identity and collection navigation. @param props - No configurable inputs. @returns Store header. */
export function StoreHeader(_props: Props): ReactElement {
  return (
    <header className="store-header">
      <a className="store-brand" href="#">
        <span className="store-logo" aria-hidden="true">
          s.
        </span>
        shopboard<span className="store-brand-dot">®</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#collection">
          The collection <span aria-hidden="true">↗</span>
        </a>
      </nav>
      <span className="store-header-note">Everyday, considered.</span>
    </header>
  );
}
