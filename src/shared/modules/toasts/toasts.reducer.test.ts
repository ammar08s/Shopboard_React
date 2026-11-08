import assert from 'node:assert/strict';
import { test } from 'node:test';
import { notificationReducer, toastReducer } from './toasts.reducer.ts';
import type { ToastMessage } from './toasts.types.ts';

/** Checks new notifications remain ordered and only the latest three are retained. No inputs.
 * @returns Nothing.
 */
function boundsQueue(): void {
  const first: ToastMessage = { id: 1, message: 'First', variant: 'success' };
  const second: ToastMessage = { id: 2, message: 'Second', variant: 'info' };
  const third: ToastMessage = { id: 3, message: 'Third', variant: 'error' };
  const fourth: ToastMessage = { id: 4, message: 'Fourth', variant: 'success' };
  const previous = [first, second, third];
  assert.deepEqual(toastReducer(previous, { type: 'show', toast: fourth }), [
    second,
    third,
    fourth,
  ]);
  assert.deepEqual(previous, [first, second, third]);
}
test('keeps the latest three notifications without mutating previous state', boundsQueue);

/** Checks repeated actions replace their previous message and dismissal targets only one ID. No inputs.
 * @returns Nothing.
 */
function replacesAndDismisses(): void {
  const old: ToastMessage = { id: 1, message: 'Added', variant: 'success' };
  const error: ToastMessage = { id: 2, message: 'Not saved', variant: 'error' };
  const repeated: ToastMessage = {
    id: 3,
    message: 'Added',
    variant: 'success',
    action: { label: 'View cart', href: '/cart' },
  };
  const next = toastReducer([old, error], { type: 'show', toast: repeated });
  assert.deepEqual(next, [error, repeated]);
  assert.deepEqual(toastReducer(next, { type: 'dismiss', id: 2 }), [repeated]);
  assert.deepEqual(toastReducer(next, { type: 'dismiss', id: 1 }), next);
  assert.deepEqual(
    toastReducer(next, { type: 'show', toast: { id: 4, message: ' ', variant: 'info' } }),
    next,
  );
}
test(
  'replaces identical messages and safely dismisses only their current IDs',
  replacesAndDismisses,
);

/** Checks announcements represent new actions rather than older messages exposed by dismissal. No inputs.
 * @returns Nothing.
 */
function announcesOnlyNewActions(): void {
  const first: ToastMessage = { id: 1, message: 'Added', variant: 'success' };
  const second: ToastMessage = { id: 2, message: 'Added', variant: 'success' };
  const initial = { toasts: [], announcement: null };
  const shown = notificationReducer(initial, { type: 'show', toast: first });
  assert.deepEqual(shown.announcement, first);
  const repeated = notificationReducer(shown, { type: 'show', toast: second });
  assert.equal(repeated.announcement?.id, 2);
  const dismissed = notificationReducer(repeated, { type: 'dismiss', id: 2 });
  assert.equal(dismissed.announcement, null);
  const older = { toasts: [first, second], announcement: second };
  assert.deepEqual(notificationReducer(older, { type: 'dismiss', id: 1 }).announcement, second);
}
test(
  'announces repeated actions by new IDs without re-announcing older dismissed messages',
  announcesOnlyNewActions,
);
