export const COMMENT_AUTHOR_MAX_LENGTH = 60;
export const COMMENT_BODY_MAX_LENGTH = 1000;

export interface CommentDraft {
  author: string;
  body: string;
}

export interface ProductComment extends CommentDraft {
  id: string;
  createdAt: string;
}

export type CommentValidation =
  { success: true; draft: CommentDraft } | { success: false; message: string };

/** Validates and normalizes a demo comment before adding it.
 * @param draft - Display name and comment text supplied by the form.
 * @returns A trimmed draft or a validation message for the user.
 */
export function validateCommentDraft(draft: CommentDraft): CommentValidation {
  const author = draft.author.trim();
  const body = draft.body.trim();
  if (author.length === 0) return { success: false, message: 'Enter a display name.' };
  if (author.length > COMMENT_AUTHOR_MAX_LENGTH)
    return {
      success: false,
      message: `Keep your display name to ${COMMENT_AUTHOR_MAX_LENGTH} characters or fewer.`,
    };
  if (body.length === 0) return { success: false, message: 'Write a comment before posting.' };
  if (body.length > COMMENT_BODY_MAX_LENGTH)
    return {
      success: false,
      message: `Keep your comment to ${COMMENT_BODY_MAX_LENGTH} characters or fewer.`,
    };
  return { success: true, draft: { author, body } };
}
