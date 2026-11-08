import { Suspense } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { SectionError } from '../SectionError/SectionError.tsx';

export interface RequestErrorProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

interface Props {
  children: ReactNode;
  loading: ReactNode;
  renderError?: (props: RequestErrorProps) => ReactNode;
  onRetry?: () => void;
}

/** Connects a section's Suspense loading UI to cache-aware error recovery.
 * @param props - Independent content, loading UI, optional contextual error UI, and retry action.
 * @returns Scoped loading/error boundaries whose reset starts a fresh request attempt.
 */
export function RequestBoundary({ children, loading, renderError, onRetry }: Props): ReactElement {
  /** Associates this error boundary with its query reset scope.
   * @param controls - Query cache error-reset controls.
   * @returns The section's Error Boundary and nested Suspense boundary.
   */
  function renderBoundary({ reset }: { reset: () => void }): ReactElement {
    /** Allows failed queries to fetch again before remounting the section. No inputs.
     * @returns Nothing; resets cache errors and invokes any explicit retry action.
     */
    function retry(): void {
      reset();
      onRetry?.();
    }
    /** Renders contextual feedback or the standard section fallback.
     * @param props - Rejected value and the Error Boundary reset action.
     * @returns A recovery UI that leaves surrounding content mounted.
     */
    function renderFailure(props: RequestErrorProps): ReactNode {
      return renderError === undefined ? (
        <SectionError resetErrorBoundary={props.resetErrorBoundary} />
      ) : (
        renderError(props)
      );
    }
    return (
      <ErrorBoundary onReset={retry} fallbackRender={renderFailure}>
        <Suspense fallback={loading}>{children}</Suspense>
      </ErrorBoundary>
    );
  }
  return <QueryErrorResetBoundary>{renderBoundary}</QueryErrorResetBoundary>;
}
