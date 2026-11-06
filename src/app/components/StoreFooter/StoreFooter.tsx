import type { ReactElement } from 'react';
import './StoreFooter.css';

interface Props {
  children?: never;
}

/**
 * Displays the store's closing description and return navigation.
 * @param props - No configurable inputs.
 * @returns Store footer with a back-to-top link.
 */
export function StoreFooter(_props: Props): ReactElement {
  return (
    <footer className="store-footer">
      <span>shopboard®</span>
      <p>A considered collection for everyday living.</p>
      <a href="#">Back to top ↑</a>
    </footer>
  );
}
