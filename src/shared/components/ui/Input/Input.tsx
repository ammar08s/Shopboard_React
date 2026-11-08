import type { ComponentProps, ReactElement } from 'react';
import { cn } from '../../../modules/ui/cn.ts';
import '../../../styles/shadcn.css';

interface Props extends ComponentProps<'input'> {}

/** Renders the shadcn/ui input with native form registration and React 19 ref support.
 * @param props - Native input attributes, ref, and optional class overrides.
 * @returns A themed input with focus, disabled, and validation states.
 */
export function Input({ className, type, ...props }: Props): ReactElement {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-md border border-solid border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}
