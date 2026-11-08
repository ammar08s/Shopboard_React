import { cva } from 'class-variance-authority';

// Adapted from shadcn/ui's new-york Button (MIT); see shared/components/ui/LICENSE.
/** Selects the shared button's utility classes.
 * @param props - Optional visual variant and class overrides.
 * @returns The selected variant's Tailwind utility classes.
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-solid border-transparent text-sm font-medium whitespace-nowrap no-underline transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
