import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Enter your full name.')
    .max(100, 'Use 100 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .max(254, 'Use 254 characters or fewer.')
    .pipe(z.email('Enter a valid email address, such as name@example.com.')),
  addressLine1: z
    .string()
    .trim()
    .min(1, 'Enter your street address.')
    .max(200, 'Use 200 characters or fewer.'),
  addressLine2: z.string().trim().max(200, 'Use 200 characters or fewer.').optional().default(''),
  city: z.string().trim().min(1, 'Enter your city.').max(100, 'Use 100 characters or fewer.'),
  region: z.string().trim().max(100, 'Use 100 characters or fewer.').optional().default(''),
  postalCode: z
    .string()
    .trim()
    .min(1, 'Enter your postal code.')
    .max(20, 'Use 20 characters or fewer.'),
  country: z.string().trim().min(1, 'Enter your country.').max(100, 'Use 100 characters or fewer.'),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutValues = z.output<typeof checkoutSchema>;

export const checkoutDefaultValues: CheckoutInput = {
  fullName: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
};
