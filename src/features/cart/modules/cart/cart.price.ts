const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Formats integer-cent cart amounts in USD. @param priceCents - Amount in cents. @returns Formatted dollar amount. */
export function formatCartPrice(priceCents: number): string {
  return currencyFormatter.format(priceCents / 100);
}
