import { formatInTimeZone } from 'date-fns-tz';
import { differenceInCalendarDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import type { Vacation } from '@/lib/types';

import { DEFAULT_TIMEZONE } from '../../booking/constants';

interface VacationsTableProps {
  vacations: Vacation[];
  onEdit: (vacation: Vacation) => void;
  onDelete: (vacation: Vacation) => void;
  pendingId?: string | null;
}

export function VacationsTable({ vacations, onEdit, onDelete, pendingId }: VacationsTableProps): JSX.Element {
  if (!vacations.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        Nenhum período de férias cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Início</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fim</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dias</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Motivo</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Criado em</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {vacations.map((item) => {
            const starts = format(new Date(item.startsOn), "dd/MM/yyyy", { locale: ptBR });
            const ends = format(new Date(item.endsOn), 'dd/MM/yyyy', { locale: ptBR });
            const days = differenceInCalendarDays(new Date(item.endsOn), new Date(item.startsOn)) + 1;

            return (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-sm text-foreground">{starts}</td>
                <td className="px-4 py-3 text-sm text-foreground">{ends}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{days} dia(s)</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{item.reason ?? '–'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatInTimeZone(new Date(item.createdAt), DEFAULT_TIMEZONE, 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                      disabled={pendingId === item.id}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(item)}
                      disabled={pendingId === item.id}
                    >
                      {pendingId === item.id ? 'Removendo...' : 'Remover'}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
