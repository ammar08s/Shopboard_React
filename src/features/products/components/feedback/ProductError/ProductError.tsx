import type { ReactElement } from 'react';
import '../productFeedback.css';

interface Props {
  message: string;
  onRetry: () => void;
}

/**
 * Explains a catalog request failure and offers another attempt.
 * @param props - Request error message and retry callback.
 * @returns Alert feedback and a retry button.
 */
export function ProductError({ message, onRetry }: Props): ReactElement {
  return (
    <section className="products-message" role="alert">
      <span className="ui-eyebrow">A small interruption</span>
      <h2>We couldn’t load the collection.</h2>
      <p>{message}</p>
      <button className="products-button" type="button" onClick={onRetry}>
        Try again
      </button>
    </section>
  );
}
