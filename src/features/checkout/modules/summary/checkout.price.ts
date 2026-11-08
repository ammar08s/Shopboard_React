const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Formats the cart's integer-cent prices for checkout display.
 * @param cents - Price in USD cents.
 * @returns A localized USD price including cents.
 */
export function formatCheckoutPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}
