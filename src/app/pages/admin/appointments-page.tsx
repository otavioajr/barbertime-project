import { useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Appointment } from '@/lib/types';

import {
  appointmentFilterSchema,
  type AppointmentFilterValues,
} from '@/features/admin/appointments/appointments-schema';
import { AppointmentFilters } from '@/features/admin/appointments/appointment-filters';
import { AppointmentsTable } from '@/features/admin/appointments/appointments-table';
import { useAdminAppointments, useAppointmentAction } from '@/features/admin/appointments/hooks';

const DEFAULT_FILTERS: AppointmentFilterValues = {
  status: 'all',
  search: '',
  from: undefined,
  to: undefined,
};

export function AdminAppointmentsPage(): JSX.Element {
  const [filters, setFilters] = useState<AppointmentFilterValues>(DEFAULT_FILTERS);
  const { data: appointments = [], isFetching, isError, error, refetch } = useAdminAppointments(filters);
  const appointmentAction = useAppointmentAction(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleApplyFilters = (nextFilters: AppointmentFilterValues) => {
    const parsed = appointmentFilterSchema.safeParse(nextFilters);
    if (parsed.success) {
      setFilters(parsed.data);
    }
  };

  const handleAction = async (appointment: Appointment, action: 'cancel' | 'confirm' | 'complete') => {
    try {
      setActionError(null);
      await appointmentAction.mutateAsync({
        appointmentId: appointment.id,
        publicToken: appointment.publicToken,
        action,
      });
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Não foi possível executar a ação no agendamento.',
      );
    }
  };

  const pendingId = appointmentAction.isPending ? appointmentAction.variables?.appointmentId ?? null : null;

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">
            Consulte, filtre e gerencie agendamentos existentes. Cancelamentos e confirmações são aplicados via Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen((prev) => !prev)}>
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} /> Atualizar
          </Button>
        </div>
      </header>

      {filtersOpen ? (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <AppointmentFilters defaultValues={filters} onApply={handleApplyFilters} />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Não foi possível carregar os agendamentos.'}
        </div>
      ) : (
        <AppointmentsTable
          appointments={appointments}
          isLoading={isFetching}
          onAction={handleAction}
          pendingId={pendingId}
          errorMessage={actionError}
        />
      )}
    </section>
  );
}
