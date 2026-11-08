import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TestContext } from 'node:test';
import { startToastTimer } from './toasts.timer.ts';

/** Checks successful/info messages expire after enough reading time.
 * @param context - Node test timer controls.
 * @returns Nothing.
 */
function expiresMessages(context: TestContext): void {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const dismissed: number[] = [];
  /** Records the expired notification.
   * @param id - Expired notification ID.
   * @returns Nothing; appends the ID to the observed results.
   */
  function dismiss(id: number): void {
    dismissed.push(id);
  }
  startToastTimer({ id: 1, message: 'Added', variant: 'success' }, dismiss);
  startToastTimer({ id: 2, message: 'Retrying', variant: 'info' }, dismiss);
  context.mock.timers.tick(5999);
  assert.deepEqual(dismissed, []);
  context.mock.timers.tick(1);
  assert.deepEqual(dismissed, [1, 2]);
}
test('auto-dismisses success and information notifications after six seconds', expiresMessages);

/** Checks error messages stay visible and cancelled timers cannot dismiss later notifications.
 * @param context - Node test timer controls.
 * @returns Nothing.
 */
function preservesErrorsAndCleansTimers(context: TestContext): void {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const dismissed: number[] = [];
  /** Records a dismissal.
   * @param id - Expired notification ID.
   * @returns Nothing; records the observed ID.
   */
  function dismiss(id: number): void {
    dismissed.push(id);
  }
  const cleanup = startToastTimer({ id: 1, message: 'Old', variant: 'success' }, dismiss);
  startToastTimer({ id: 2, message: 'Storage unavailable', variant: 'error' }, dismiss);
  context.mock.timers.tick(2000);
  cleanup();
  startToastTimer({ id: 3, message: 'New', variant: 'success' }, dismiss);
  context.mock.timers.tick(4000);
  assert.deepEqual(dismissed, []);
  context.mock.timers.tick(2000);
  assert.deepEqual(dismissed, [3]);
  context.mock.timers.tick(60000);
  assert.deepEqual(dismissed, [3]);
}
test(
  'keeps errors visible and cleans up timers when messages pause or unmount',
  preservesErrorsAndCleansTimers,
);
