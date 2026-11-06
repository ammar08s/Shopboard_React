const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
/** Formats an integer minor-unit price. @param cents - Price in cents. @returns USD display price. */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}
