/** Selects useful request feedback without assuming a thrown value is an Error.
 * @param error - Unknown thrown or rejected value.
 * @param fallback - User-facing feedback when no error message is available.
 * @returns A nonempty request error message.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim() !== '' ? error.message : fallback;
}
