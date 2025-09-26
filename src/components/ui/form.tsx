import * as React from 'react';
import type { FieldError, FieldValues, FormProviderProps } from 'react-hook-form';
import { FormProvider, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';

interface FormProps<TFieldValues extends FieldValues = FieldValues>
  extends Pick<FormProviderProps<TFieldValues>, 'children'>
{
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  className?: string;
}

export function Form<TFieldValues extends FieldValues>({ children, onSubmit, className }: FormProps<TFieldValues>): JSX.Element {
  return (
    <form noValidate className={className} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export { FormProvider };

function ErrorText({ error }: { error?: FieldError }): JSX.Element | null {
  if (!error) {
    return null;
  }

  return <p className="text-sm text-destructive">{error.message}</p>;
}

type FormItemProps = React.HTMLAttributes<HTMLDivElement>;

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('space-y-2', className)} {...props} />;
});
FormItem.displayName = 'FormItem';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  description?: string;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(({ className, children, description, ...props }, ref) => {
  return (
    <label ref={ref} className={cn('flex flex-col gap-1 text-sm font-medium text-foreground', className)} {...props}>
      {children}
      {description ? <span className="text-xs text-muted-foreground">{description}</span> : null}
    </label>
  );
});
FormLabel.displayName = 'FormLabel';

interface FormFieldProps {
  name: string;
  children: (props: { error?: FieldError }) => React.ReactNode;
}

function FormField({ name, children }: FormFieldProps): JSX.Element {
  const form = useFormContext();
  const fieldState = form.getFieldState(name, form.formState);

  return <>{children({ error: fieldState.error })}</>;
}

export { ErrorText, FormField, FormItem, FormLabel };
