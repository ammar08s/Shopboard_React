import { useRef, useState } from 'react';
import type { CommentDraft } from './products.comments.ts';
import {
  COMMENTS_STORAGE_ERROR,
  loadProductComments,
  saveProductComments,
} from './products.comments.storage.ts';
import type { StoredProductComments } from './products.comments.storage.ts';

/** Owns local comments for one mounted product section.
 * @param productId - Stable product ID; the owning component remounts this section when it changes.
 * @returns Comments, storage feedback, and an action that accepts a validated draft.
 */
export function useProductComments(productId: number): StoredProductComments & {
  addComment: (draft: CommentDraft) => boolean;
} {
  /** Restores comments while tolerating a denied localStorage getter. No inputs.
   * @returns The selected product's comments or an empty in-memory list with feedback.
   */
  function loadInitialComments(): StoredProductComments {
    try {
      return loadProductComments(window.localStorage, productId);
    } catch {
      return { comments: [], storageError: COMMENTS_STORAGE_ERROR };
    }
  }
  const [state, setState] = useState(loadInitialComments);
  const latestComments = useRef(state.comments);

  /** Prepends a validated comment and attempts browser-only persistence.
   * @param draft - Trimmed draft accepted by the comment validator.
   * @returns Whether persistence succeeded; failed writes keep the comment until this section unmounts.
   */
  function addComment(draft: CommentDraft): boolean {
    const comment = { ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const comments = [comment, ...latestComments.current];
    let storageError: string | null;
    try {
      storageError = saveProductComments(window.localStorage, productId, comments);
    } catch {
      storageError = COMMENTS_STORAGE_ERROR;
    }
    latestComments.current = comments;
    setState({ comments, storageError });
    return storageError === null;
  }

  return { ...state, addComment };
}
