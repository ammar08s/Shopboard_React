/** Validates a product route parameter before requesting API data.
 * @param value - Route parameter, or undefined when absent.
 * @returns A positive safe-integer ID, or null for malformed and local-only IDs.
 */
export function parseProductId(value: string | undefined): number | null {
  if (value === undefined || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
