import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ErrorText, Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WorkHour } from '@/lib/types';

import { workHourFormSchema, type WorkHourFormValues } from './work-hour-schema';

const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

interface WorkHourFormProps {
  initialValues?: WorkHour | null;
  onSubmit: (values: WorkHourFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

export function WorkHourForm({ initialValues, onSubmit, onCancel, submitting = false }: WorkHourFormProps): JSX.Element {
  const form = useForm<WorkHourFormValues>({
    resolver: zodResolver(workHourFormSchema),
    defaultValues: {
      id: initialValues?.id,
      weekday: initialValues?.weekday ?? 1,
      startTime: initialValues?.startTime.slice(0, 5) ?? '09:00',
      endTime: initialValues?.endTime.slice(0, 5) ?? '18:00',
      active: initialValues?.active ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      id: initialValues?.id,
      weekday: initialValues?.weekday ?? 1,
      startTime: initialValues?.startTime.slice(0, 5) ?? '09:00',
      endTime: initialValues?.endTime.slice(0, 5) ?? '18:00',
      active: initialValues?.active ?? true,
    });
  }, [initialValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form className="space-y-4" onSubmit={handleSubmit}>
      <FormField name="weekday">
        {({ error }) => (
          <FormItem>
            <FormLabel htmlFor="weekday">Dia da semana</FormLabel>
            <select
              id="weekday"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...form.register('weekday', { valueAsNumber: true })}
            >
              {WEEKDAYS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
            <ErrorText error={error} />
          </FormItem>
        )}
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="startTime">
          {({ error }) => (
            <FormItem>
              <FormLabel htmlFor="start-time">Início</FormLabel>
              <Input id="start-time" type="time" step={60} {...form.register('startTime')} />
              <ErrorText error={error} />
            </FormItem>
          )}
        </FormField>
        <FormField name="endTime">
          {({ error }) => (
            <FormItem>
              <FormLabel htmlFor="end-time">Fim</FormLabel>
              <Input id="end-time" type="time" step={60} {...form.register('endTime')} />
              <ErrorText error={error} />
            </FormItem>
          )}
        </FormField>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="work-hour-active"
          type="checkbox"
          className="h-4 w-4 rounded border border-input"
          checked={form.watch('active')}
          onChange={(event) => form.setValue('active', event.target.checked)}
        />
        <Label htmlFor="work-hour-active" className="cursor-pointer text-sm font-medium">
          Horário ativo
        </Label>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar horário'}
        </Button>
      </div>
    </Form>
  );
}
