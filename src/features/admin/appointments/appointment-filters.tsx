import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { appointmentFilterSchema, type AppointmentFilterValues } from './appointments-schema';
import { zodResolver } from '@hookform/resolvers/zod';

interface AppointmentFiltersProps {
  defaultValues: AppointmentFilterValues;
  onApply: (values: AppointmentFilterValues) => void;
}

export function AppointmentFilters({ defaultValues, onApply }: AppointmentFiltersProps): JSX.Element {
  const { control, handleSubmit, reset } = useForm<AppointmentFilterValues>({
    resolver: zodResolver(appointmentFilterSchema),
    defaultValues,
  });

  const submit = handleSubmit((values) => {
    onApply(values);
  });

  const handleReset = () => {
    reset({ status: 'all', search: '', from: undefined, to: undefined });
    onApply({ status: 'all', search: '', from: undefined, to: undefined });
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={submit}>
      <Controller
        control={control}
        name="search"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input id="search" placeholder="Nome ou telefone" {...field} />
          </div>
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              {...field}
              id="status"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="scheduled">Agendado</option>
              <option value="confirmed">Confirmado</option>
              <option value="canceled">Cancelado</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
        )}
      />
      <Controller
        control={control}
        name="from"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="from">Data inicial</Label>
            <Input id="from" type="date" {...field} />
          </div>
        )}
      />
      <Controller
        control={control}
        name="to"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="to">Data final</Label>
            <Input id="to" type="date" {...field} />
          </div>
        )}
      />
      <div className="col-span-full flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={handleReset}>
          Limpar filtros
        </Button>
        <Button type="submit">Aplicar</Button>
      </div>
    </form>
  );
}
