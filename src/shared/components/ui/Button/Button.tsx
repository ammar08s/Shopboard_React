import type { ComponentProps, ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../../modules/ui/cn.ts';
import { buttonVariants } from '../../../modules/ui/buttonVariants.ts';
import '../../../styles/shadcn.css';
import './Button.css';

interface Props extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/** Renders the shadcn/ui button or applies its styles to a child link.
 * @param props - Native button/ref attributes, visual variant, and optional child composition.
 * @returns A keyboard-operable action styled with the shared theme.
 */
export function Button({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: Props): ReactElement {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      data-slot="button"
      data-variant={variant}
      className={cn('ui-button', buttonVariants({ variant, className }))}
      {...props}
    />
  );
}
