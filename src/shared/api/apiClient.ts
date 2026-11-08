export class HttpError extends Error {
  readonly status: number;

  /** Creates an HTTP failure that feature clients can distinguish by status.
   * @param status - Unsuccessful response status.
   * @returns An error carrying the HTTP status and user-facing message.
   */
  constructor(status: number) {
    super(`The store is unavailable (${status}). Please try again.`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Reads JSON through the shared transport. @param path - API path. @param signal - Request cancellation. @returns Untrusted response data. @throws Error for network or HTTP failures. */
export async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
  const baseUrl = import.meta.env?.VITE_API_BASE_URL || 'https://shopboard-api.vercel.app';
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new HttpError(response.status);
  return response.json();
}
