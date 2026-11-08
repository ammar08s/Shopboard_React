import type { ReactElement } from 'react';
import './SectionError.css';

interface Props {
  resetErrorBoundary: () => void;
}

/** Offers local recovery without replacing neighboring content or shared application state.
 * @param props - Action that resets the nearest failed section.
 * @returns Accessible section failure feedback and an explicit retry button.
 */
export function SectionError({ resetErrorBoundary }: Props): ReactElement {
  return (
    <section className="ui-section-error" role="alert">
      <h2>This section couldn’t be displayed</h2>
      <p>The rest of the page is still available. Try this section again.</p>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </section>
  );
}
