import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  COMMENT_AUTHOR_MAX_LENGTH,
  COMMENT_BODY_MAX_LENGTH,
  validateCommentDraft,
} from './products.comments.ts';
import type { ProductComment } from './products.comments.ts';
import { loadProductComments, saveProductComments } from './products.comments.storage.ts';

class MemoryStorage {
  values = new Map<string, string>();

  /** Reads a saved test value.
   * @param key - Storage entry to read.
   * @returns The stored value, or null when absent.
   */
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  /** Stores a test value.
   * @param key - Storage entry to update.
   * @param value - Serialized comments.
   * @returns Nothing; updates the in-memory storage fixture.
   */
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const comment: ProductComment = {
  id: 'comment-one',
  author: 'Alex',
  body: 'A useful everyday bag.\nI like the simple design.',
  createdAt: '2026-11-08T12:00:00.000Z',
};

/** Checks normalized comment text and preserves meaningful line breaks. No inputs.
 * @returns Nothing; asserts the valid draft contains trimmed user text.
 */
function validatesComment(): void {
  assert.deepEqual(validateCommentDraft({ author: ' Alex ', body: ' First line\nSecond line ' }), {
    success: true,
    draft: { author: 'Alex', body: 'First line\nSecond line' },
  });
}

test('trims valid comment drafts and preserves line breaks', validatesComment);

/** Checks empty and overlong comment fields. No inputs.
 * @returns Nothing; asserts invalid submissions produce useful validation errors.
 */
function rejectsInvalidComments(): void {
  const invalidDrafts = [
    { author: ' ', body: 'Hello' },
    { author: 'Alex', body: '\n ' },
    { author: 'a'.repeat(COMMENT_AUTHOR_MAX_LENGTH + 1), body: 'Hello' },
    { author: 'Alex', body: 'a'.repeat(COMMENT_BODY_MAX_LENGTH + 1) },
  ];
  for (const draft of invalidDrafts) assert.equal(validateCommentDraft(draft).success, false);
}

test('rejects blank and overlong comment fields', rejectsInvalidComments);

/** Confirms that saved comments remain attached only to their product. No inputs.
 * @returns Nothing; asserts round-trip persistence and product isolation.
 */
function storesCommentsPerProduct(): void {
  const storage = new MemoryStorage();
  assert.equal(saveProductComments(storage, 1, [comment]), null);
  assert.deepEqual(loadProductComments(storage, 1), { comments: [comment], storageError: null });
  assert.deepEqual(loadProductComments(storage, 2), { comments: [], storageError: null });
  const otherComment = { ...comment, id: 'comment-two', body: 'For the second product.' };
  saveProductComments(storage, 2, [otherComment]);
  assert.deepEqual(loadProductComments(storage, 1).comments, [comment]);
  assert.deepEqual(loadProductComments(storage, 2).comments, [otherComment]);
}

test('persists comments independently for each product', storesCommentsPerProduct);

/** Checks saved input before exposing it to the comment UI. No inputs.
 * @returns Nothing; asserts corrupt, unsupported, duplicate, and malformed records are discarded.
 */
function rejectsCorruptStorage(): void {
  const invalidValues = [
    'not JSON',
    JSON.stringify({ version: 2, comments: [comment] }),
    JSON.stringify({ version: 1, comments: [comment, comment] }),
    JSON.stringify({ version: 1, comments: [{ ...comment, author: '' }] }),
    JSON.stringify({ version: 1, comments: [{ ...comment, createdAt: 'invalid date' }] }),
    JSON.stringify({ version: 1, comments: [{ ...comment, body: 42 }] }),
  ];
  for (const serialized of invalidValues) {
    /** Supplies one malformed saved list.
     * @param _key - Requested storage key; unused by this fixture.
     * @returns The malformed saved value.
     */
    function getItem(_key: string): string {
      return serialized;
    }
    const restored = loadProductComments({ getItem }, 1);
    assert.deepEqual(restored.comments, []);
    assert.equal(typeof restored.storageError, 'string');
  }
}

test('recovers from corrupt or unsupported saved comments', rejectsCorruptStorage);

/** Checks browsers that deny comment storage reads or writes. No inputs.
 * @returns Nothing; asserts storage failures are reported without crashing.
 */
function handlesBlockedStorage(): void {
  /** Simulates blocked storage access.
   * @param _key - Requested storage key; unused because access fails.
   * @returns No value; always throws an access error.
   */
  function getItem(_key: string): string | null {
    throw new Error('Storage blocked');
  }
  /** Simulates a failed write.
   * @param _key - Target storage key; unused because access fails.
   * @param _value - Serialized comments that cannot be persisted.
   * @returns Nothing; always throws a quota error.
   */
  function setItem(_key: string, _value: string): void {
    throw new Error('Quota exceeded');
  }
  assert.equal(typeof loadProductComments({ getItem }, 1).storageError, 'string');
  assert.equal(typeof saveProductComments({ setItem }, 1, [comment]), 'string');
}

test('reports blocked comment storage without throwing', handlesBlockedStorage);
