import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../../shared/components/ui/Button/Button.tsx';
import { focusElement } from '../../../../shared/modules/focus/focusElement.ts';
import type { CheckoutItem } from '../../modules/summary/checkout.types.ts';
import { checkoutDefaultValues, checkoutSchema } from '../../modules/validation/checkout.schema.ts';
import type { CheckoutInput, CheckoutValues } from '../../modules/validation/checkout.schema.ts';
import { CheckoutField } from '../CheckoutField/CheckoutField.tsx';
import { CheckoutSummary } from '../CheckoutSummary/CheckoutSummary.tsx';
import './Checkout.css';

interface Props {
  items: CheckoutItem[];
  totalCents: number;
  storageError: string | null;
  onComplete: () => void;
}

/** Owns checkout form state and displays validation, empty-cart, submission, and success feedback.
 * @param props - Shared cart lines, derived total, storage feedback, and the demo completion action.
 * @returns An accessible browser-only checkout without storing or transmitting delivery details.
 */
export function Checkout({ items, totalCents, storageError, onComplete }: Props): ReactElement {
  const form = useForm<CheckoutInput, undefined, CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });
  const { errors, isSubmitting, isSubmitSuccessful } = form.formState;

  /** Completes a valid demo checkout, retaining form values when the action fails. No inputs.
   * @returns Nothing; clears the shared cart on success or exposes a retryable form-level error.
   */
  function completeCheckout(): void {
    if (items.length === 0) {
      form.setError('root.checkout', {
        message: 'Your cart is empty. Add an item before checking out.',
      });
      return;
    }
    try {
      onComplete();
    } catch {
      form.setError('root.checkout', {
        message:
          'We couldn’t finish the demo checkout. Your details are still here. Please try again.',
      });
    }
  }

  if (isSubmitSuccessful) {
    return (
      <section className="checkout-section checkout-result">
        <span className="checkout-result-mark" aria-hidden="true">
          ✓
        </span>
        <p className="checkout-eyebrow">ALL SET</p>
        <h1 ref={focusElement} tabIndex={-1}>
          Demo checkout complete<span>.</span>
        </h1>
        <p>
          Your details passed validation and your cart is now clear. No order was placed and no
          payment was taken.
        </p>
        {storageError === null ? null : (
          <p className="checkout-notice" role="alert">
            Your cart is clear for this visit, but browser storage could not be updated. Saved items
            may return after refresh.
          </p>
        )}
        <Button asChild>
          <Link to="/">Continue shopping</Link>
        </Button>
      </section>
    );
  }

  if (items.length === 0 && !isSubmitting) {
    return (
      <section className="checkout-section checkout-result">
        <p className="checkout-eyebrow">ONE THING FIRST</p>
        <h1>
          Your cart is empty<span>.</span>
        </h1>
        <p>Add an everyday essential to your cart before checking out.</p>
        {storageError === null ? null : (
          <p className="checkout-notice" role="alert">
            {storageError}
          </p>
        )}
        <Button asChild>
          <Link to="/">Explore the collection</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="checkout-section" aria-labelledby="checkout-heading">
      <Button asChild variant="outline" className="checkout-back">
        <Link to="/cart">&larr; Back to your cart</Link>
      </Button>
      <p className="checkout-eyebrow">THE LAST LITTLE DETAILS</p>
      <h1 id="checkout-heading">
        Checkout<span>.</span>
      </h1>
      <p className="checkout-intro">
        A quick practice run. No payment is collected and no order is placed.
      </p>
      {storageError === null ? null : (
        <p className="checkout-notice" role="alert">
          {storageError}
        </p>
      )}
      <div className="checkout-layout">
        <FormProvider {...form}>
          <form
            className="checkout-form"
            onSubmit={form.handleSubmit(completeCheckout)}
            noValidate
            aria-busy={isSubmitting}
          >
            {Object.keys(errors).length > 0 ? (
              <p className="checkout-form-error" role="alert">
                {errors.root?.checkout?.message ??
                  'Please check the highlighted fields and try again.'}
              </p>
            ) : null}
            <fieldset>
              <legend>1. Contact details</legend>
              <p>All fields are required unless marked optional.</p>
              <CheckoutField name="fullName" label="Full name" autoComplete="shipping name" />
              <CheckoutField
                name="email"
                label="Email address"
                type="email"
                autoComplete="shipping email"
              />
            </fieldset>
            <fieldset>
              <legend>2. Delivery address</legend>
              <CheckoutField
                name="addressLine1"
                label="Street address"
                autoComplete="shipping address-line1"
              />
              <CheckoutField
                name="addressLine2"
                label="Apartment, suite, etc."
                autoComplete="shipping address-line2"
                optional
              />
              <div className="checkout-field-row">
                <CheckoutField name="city" label="City" autoComplete="shipping address-level2" />
                <CheckoutField
                  name="region"
                  label="State / province / region"
                  autoComplete="shipping address-level1"
                  optional
                />
              </div>
              <div className="checkout-field-row">
                <CheckoutField
                  name="postalCode"
                  label="Postal code"
                  autoComplete="shipping postal-code"
                />
                <CheckoutField
                  name="country"
                  label="Country"
                  autoComplete="shipping country-name"
                />
              </div>
            </fieldset>
            <div className="checkout-form-actions">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Completing demo…' : 'Complete demo checkout'}
              </Button>
              <p>Your contact and delivery details stay on this page and are not saved.</p>
            </div>
          </form>
        </FormProvider>
        <CheckoutSummary items={items} totalCents={totalCents} />
      </div>
    </section>
  );
}
