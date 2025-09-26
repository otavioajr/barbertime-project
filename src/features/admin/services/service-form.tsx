import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ErrorText, Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Service } from '@/lib/types';

import { serviceFormSchema, type ServiceFormValues } from './service-schema';

interface ServiceFormProps {
  initialValues?: Service | null;
  onSubmit: (values: ServiceFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

export function ServiceForm({ initialValues, onSubmit, onCancel, submitting = false }: ServiceFormProps): JSX.Element {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      id: initialValues?.id,
      name: initialValues?.name ?? '',
      durationMin: initialValues?.durationMin ?? 30,
      priceCents:
        initialValues?.priceCents !== undefined && initialValues?.priceCents !== null
          ? initialValues.priceCents / 100
          : null,
      active: initialValues?.active ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      id: initialValues?.id,
      name: initialValues?.name ?? '',
      durationMin: initialValues?.durationMin ?? 30,
      priceCents:
        initialValues?.priceCents !== undefined && initialValues?.priceCents !== null
          ? initialValues.priceCents / 100
          : null,
      active: initialValues?.active ?? true,
    });
  }, [initialValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const priceValue = Number.isFinite(values.priceCents) ? values.priceCents : null;
    const priceCents = priceValue === null ? null : Math.round(priceValue * 100);

    await onSubmit({
      id: values.id,
      name: values.name,
      durationMin: values.durationMin,
      priceCents,
      active: values.active,
    });
  });

  return (
    <Form className="space-y-4" onSubmit={handleSubmit}>
      <FormField name="name">
        {({ error }) => (
          <FormItem>
            <FormLabel htmlFor="service-name">Nome</FormLabel>
            <Input id="service-name" placeholder="Corte clássico" {...form.register('name')} />
            <ErrorText error={error} />
          </FormItem>
        )}
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="durationMin">
          {({ error }) => (
            <FormItem>
              <FormLabel htmlFor="service-duration">Duração (minutos)</FormLabel>
              <Input id="service-duration" type="number" min={5} step={5} {...form.register('durationMin')} />
              <ErrorText error={error} />
            </FormItem>
          )}
        </FormField>
        <FormField name="priceCents">
          {({ error }) => (
            <FormItem>
              <FormLabel htmlFor="service-price">Preço (R$)</FormLabel>
              <Input
                id="service-price"
                type="number"
                min={0}
                step={0.5}
                placeholder="Ex.: 45"
                {...form.register('priceCents', { valueAsNumber: true })}
              />
              <ErrorText error={error} />
            </FormItem>
          )}
        </FormField>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="service-active"
          type="checkbox"
          className="h-4 w-4 rounded border border-input"
          checked={form.watch('active')}
          onChange={(event) => form.setValue('active', event.target.checked)}
        />
        <Label htmlFor="service-active" className="cursor-pointer text-sm font-medium">
          Serviço ativo
        </Label>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar serviço'}
        </Button>
      </div>
    </Form>
  );
}
