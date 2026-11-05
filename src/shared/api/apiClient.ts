const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://shopboard-api.vercel.app';

/** Reads JSON through the shared transport. @param path - API path. @param signal - Request cancellation. @returns Untrusted response data. @throws Error for network or HTTP failures. */
export async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok)
    throw new Error(`The store is unavailable (${response.status}). Please try again.`);
  return response.json();
}
