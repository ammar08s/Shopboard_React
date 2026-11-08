import { useId } from 'react';
import type { ReactElement } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { Input } from '../../../../shared/components/ui/Input/Input.tsx';
import { Label } from '../../../../shared/components/ui/Label/Label.tsx';
import type { CheckoutInput, CheckoutValues } from '../../modules/validation/checkout.schema.ts';
import './CheckoutField.css';

interface Props {
  name: keyof CheckoutInput;
  label: string;
  autoComplete: string;
  type?: 'text' | 'email';
  optional?: boolean;
}

/** Registers one checkout field and connects its label and schema error to the input.
 * @param props - Field name, visible label, autofill hint, input type, and optional-field indicator.
 * @returns A shadcn/ui control subscribed only to its own form error.
 */
export function CheckoutField({
  name,
  label,
  autoComplete,
  type = 'text',
  optional = false,
}: Props): ReactElement {
  const id = useId();
  const { register, control } = useFormContext<CheckoutInput, undefined, CheckoutValues>();
  const { errors } = useFormState({ control, name });
  const message = errors[name]?.message;
  return (
    <div className="checkout-field" data-invalid={message !== undefined}>
      <Label htmlFor={id}>
        {label}
        {optional ? <span className="checkout-field-optional">Optional</span> : null}
      </Label>
      <Input
        {...register(name)}
        id={id}
        type={type}
        autoComplete={autoComplete}
        aria-required={!optional}
        aria-invalid={message !== undefined}
        aria-describedby={message === undefined ? undefined : `${id}-error`}
      />
      {message === undefined ? null : (
        <p id={`${id}-error`} className="checkout-field-error">
          {message}
        </p>
      )}
    </div>
  );
}
