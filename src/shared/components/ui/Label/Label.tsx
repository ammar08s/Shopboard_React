import type { ComponentProps, ReactElement } from 'react';
import { Root } from '@radix-ui/react-label';
import { cn } from '../../../modules/ui/cn.ts';
import '../../../styles/shadcn.css';

interface Props extends ComponentProps<typeof Root> {}

/** Renders the shadcn/ui label backed by Radix's accessible label primitive.
 * @param props - Label content, target input ID, ref, and class overrides.
 * @returns A themed label linked to its form control.
 */
export function Label({ className, ...props }: Props): ReactElement {
  return (
    <Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
