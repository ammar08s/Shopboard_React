import { validateCommentDraft } from './products.comments.ts';
import type { ProductComment } from './products.comments.ts';

export const COMMENTS_STORAGE_ERROR =
  'Browser storage is unavailable. New comments will remain until you leave or refresh this page.';

const STORAGE_KEY_PREFIX = 'shopboard.comments.v1';

const INVALID_COMMENTS_MESSAGE =
  'Saved demo comments could not be read. You can add new comments below.';

export interface StoredProductComments {
  comments: ProductComment[];
  storageError: string | null;
}

/** Validates an unknown comment without trusting browser storage.
 * @param value - Saved comment to inspect.
 * @returns Whether the value contains canonical text, a stable ID, and an ISO timestamp.
 */
function isProductComment(value: unknown): value is ProductComment {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    value.id.trim().length === 0 ||
    !('author' in value) ||
    typeof value.author !== 'string' ||
    !('body' in value) ||
    typeof value.body !== 'string' ||
    !('createdAt' in value) ||
    typeof value.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(value.createdAt))
  )
    return false;
  const validation = validateCommentDraft({ author: value.author, body: value.body });
  return (
    validation.success &&
    validation.draft.author === value.author &&
    validation.draft.body === value.body &&
    new Date(value.createdAt).toISOString() === value.createdAt
  );
}

/** Parses a complete saved list, rejecting corrupt records and duplicate IDs.
 * @param serialized - Untrusted JSON from the product's storage entry.
 * @returns Validated comments in their saved order, or null when invalid.
 */
function parseComments(serialized: string): ProductComment[] | null {
  try {
    const value: unknown = JSON.parse(serialized);
    if (
      typeof value !== 'object' ||
      value === null ||
      !('version' in value) ||
      value.version !== 1 ||
      !('comments' in value) ||
      !Array.isArray(value.comments)
    )
      return null;
    const comments: ProductComment[] = [];
    const ids = new Set<string>();
    for (const comment of value.comments) {
      if (!isProductComment(comment) || ids.has(comment.id)) return null;
      ids.add(comment.id);
      comments.push({
        id: comment.id,
        author: comment.author,
        body: comment.body,
        createdAt: comment.createdAt,
      });
    }
    return comments;
  } catch {
    return null;
  }
}

/** Restores comments saved only for the selected product.
 * @param storage - Browser-compatible storage reader.
 * @param productId - Product whose demo comments should be restored.
 * @returns Comments and recoverable feedback for corrupt or blocked storage.
 */
export function loadProductComments(
  storage: Pick<Storage, 'getItem'>,
  productId: number,
): StoredProductComments {
  let serialized: string | null;
  try {
    serialized = storage.getItem(`${STORAGE_KEY_PREFIX}.${productId}`);
  } catch {
    return { comments: [], storageError: COMMENTS_STORAGE_ERROR };
  }
  if (serialized === null) return { comments: [], storageError: null };
  const comments = parseComments(serialized);
  return comments === null
    ? { comments: [], storageError: INVALID_COMMENTS_MESSAGE }
    : { comments, storageError: null };
}

/** Saves a product's comment list without any API request.
 * @param storage - Browser-compatible storage writer.
 * @param productId - Product owning the comments.
 * @param comments - Validated comments in newest-first order.
 * @returns Null when saved, or a message when browser persistence fails.
 */
export function saveProductComments(
  storage: Pick<Storage, 'setItem'>,
  productId: number,
  comments: ProductComment[],
): string | null {
  try {
    storage.setItem(`${STORAGE_KEY_PREFIX}.${productId}`, JSON.stringify({ version: 1, comments }));
    return null;
  } catch {
    return COMMENTS_STORAGE_ERROR;
  }
}
