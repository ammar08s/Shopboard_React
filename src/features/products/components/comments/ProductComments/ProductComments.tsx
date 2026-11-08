import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import {
  COMMENT_AUTHOR_MAX_LENGTH,
  COMMENT_BODY_MAX_LENGTH,
  validateCommentDraft,
} from '../../../modules/comments/products.comments.ts';
import type { ProductComment } from '../../../modules/comments/products.comments.ts';
import { useProductComments } from '../../../modules/comments/useProductComments.ts';
import './ProductComments.css';

interface Props {
  productId: number;
}

/** Displays browser-only comments and a validated form for one product.
 * @param props - Product owning this mounted comment section.
 * @returns Existing comments, empty/storage feedback, and the local comment form.
 */
export function ProductComments({ productId }: Props): ReactElement {
  const { comments, storageError, addComment } = useProductComments(productId);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const headingId = `products-comments-title-${productId}`;
  const errorId = `products-comments-error-${productId}`;
  const authorId = `products-comments-author-${productId}`;
  const bodyId = `products-comments-body-${productId}`;

  /** Validates a submitted draft and adds it without a network request.
   * @param event - Comment form submission.
   * @returns Nothing; shows validation feedback or resets the successful form.
   */
  function submitComment(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const validation = validateCommentDraft({
      author: String(values.get('author') ?? ''),
      body: String(values.get('body') ?? ''),
    });
    if (!validation.success) {
      setError(validation.message);
      setMessage(null);
      return;
    }
    const saved = addComment(validation.draft);
    setError(null);
    setMessage(saved ? 'Your demo comment was added.' : 'Your comment was added to this page.');
    form.reset();
  }

  /** Displays one saved comment as plain text.
   * @param comment - Validated comment with a stable ID and timestamp.
   * @returns A keyed list item without interpreting user text as HTML.
   */
  function renderComment(comment: ProductComment): ReactElement {
    return (
      <li key={comment.id} className="products-comment">
        <div className="products-comment-meta">
          <strong>{comment.author}</strong>
          <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString()}</time>
        </div>
        <p>{comment.body}</p>
      </li>
    );
  }

  return (
    <section className="products-comments" aria-labelledby={headingId}>
      <div className="products-comments-heading">
        <h2 id={headingId}>
          Comments <span>({comments.length})</span>
        </h2>
        <span className="products-comments-badge">Demo only</span>
      </div>
      <p className="products-comments-note">
        Comments are saved only in this browser for this product.
      </p>
      {storageError !== null ? (
        <p className="products-comments-warning" role="status">
          {storageError}
        </p>
      ) : null}
      {comments.length === 0 ? (
        <p className="products-comments-empty">No comments yet.</p>
      ) : (
        <ol className="products-comments-list">{comments.map(renderComment)}</ol>
      )}
      <form
        className="products-comments-form"
        onSubmit={submitComment}
        aria-describedby={error === null ? undefined : errorId}
      >
        <h3>Leave a comment</h3>
        <label htmlFor={authorId}>Display name</label>
        <input
          id={authorId}
          name="author"
          autoComplete="nickname"
          maxLength={COMMENT_AUTHOR_MAX_LENGTH}
          required
        />
        <label htmlFor={bodyId}>Your comment</label>
        <textarea id={bodyId} name="body" rows={4} maxLength={COMMENT_BODY_MAX_LENGTH} required />
        <p className="products-comments-limit">Up to {COMMENT_BODY_MAX_LENGTH} characters.</p>
        {error !== null ? (
          <p id={errorId} className="products-comments-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit">Post demo comment</button>
        <p className="products-comments-success" role="status">
          {/* Replace the message for each post while keeping the live region mounted. */}
          {message !== null ? <span key={comments[0]?.id}>{message}</span> : null}
        </p>
      </form>
    </section>
  );
}
