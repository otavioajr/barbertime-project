import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ErrorText, Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Vacation } from '@/lib/types';

import { vacationFormSchema, type VacationFormValues } from './vacation-schema';

interface VacationFormProps {
  initialValues?: Vacation | null;
  onSubmit: (values: VacationFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

export function VacationForm({ initialValues, onSubmit, onCancel, submitting = false }: VacationFormProps): JSX.Element {
  const form = useForm<VacationFormValues>({
    resolver: zodResolver(vacationFormSchema),
    defaultValues: {
      id: initialValues?.id,
      startsOn: initialValues?.startsOn ?? '',
      endsOn: initialValues?.endsOn ?? '',
      reason: initialValues?.reason ?? null,
    },
  });

  useEffect(() => {
    form.reset({
      id: initialValues?.id,
      startsOn: initialValues?.startsOn ?? '',
      endsOn: initialValues?.endsOn ?? '',
      reason: initialValues?.reason ?? null,
    });
  }, [initialValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="startsOn">
          {({ error }) => (
            <FormItem>
              <FormLabel htmlFor="vacation-start">Início</FormLabel>
              <Input id="vacation-start" type="date" {...form.register('startsOn')} />
              <ErrorText error={error} />
            </FormItem>
          )}
        </FormField>
        <FormField name="endsOn">
          {({ error }) => (
            <FormItem>
              <FormLabel htmlFor="vacation-end">Fim</FormLabel>
              <Input id="vacation-end" type="date" {...form.register('endsOn')} />
              <ErrorText error={error} />
            </FormItem>
          )}
        </FormField>
      </div>

      <FormField name="reason">
        {({ error }) => (
          <FormItem>
            <FormLabel htmlFor="vacation-reason">Motivo (opcional)</FormLabel>
            <Input id="vacation-reason" placeholder="Ex.: Férias coletivas" {...form.register('reason')} />
            <ErrorText error={error} />
          </FormItem>
        )}
      </FormField>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar período'}
        </Button>
      </div>
    </Form>
  );
}
