import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combines conditional classes and resolves conflicting Tailwind utilities.
 * @param inputs - Classes accepted by clsx.
 * @returns One class string with later conflicting utilities taking precedence.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
