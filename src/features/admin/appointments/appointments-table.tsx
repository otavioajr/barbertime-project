import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import type { Appointment } from '@/lib/types';

const STATUS_LABELS: Record<Appointment['status'], string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  canceled: 'Cancelado',
  completed: 'Concluído',
};

interface AppointmentsTableProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onAction: (appointment: Appointment, action: 'cancel' | 'confirm' | 'complete') => void;
  pendingId?: string | null;
  errorMessage?: string | null;
}

export function AppointmentsTable({
  appointments,
  isLoading,
  onAction,
  pendingId,
  errorMessage,
}: AppointmentsTableProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        Carregando agendamentos...
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        Nenhum agendamento encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefone</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Serviço</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Início</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {appointments.map((appointment) => {
              const isPending = pendingId === appointment.id;
              const startsAtLabel = format(new Date(appointment.startsAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

              return (
                <tr key={appointment.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm text-foreground">
                    {appointment.customerName ?? 'Cliente sem nome'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{appointment.customerPhone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{appointment.serviceName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{startsAtLabel}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-muted text-foreground">
                      {STATUS_LABELS[appointment.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      {appointment.status !== 'canceled' && appointment.status !== 'completed' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => onAction(appointment, 'cancel')}
                        >
                          {isPending ? 'Cancelando...' : 'Cancelar'}
                        </Button>
                      ) : null}
                      {appointment.status === 'scheduled' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isPending}
                          onClick={() => onAction(appointment, 'confirm')}
                        >
                          {isPending ? 'Confirmando...' : 'Confirmar'}
                        </Button>
                      ) : null}
                      {appointment.status === 'confirmed' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => onAction(appointment, 'complete')}
                        >
                          {isPending ? 'Finalizando...' : 'Concluir'}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
