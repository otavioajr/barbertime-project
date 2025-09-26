import { formatInTimeZone } from 'date-fns-tz';

import { Button } from '@/components/ui/button';
import type { WorkHour } from '@/lib/types';

import { DEFAULT_TIMEZONE } from '../../booking/constants';

const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

interface WorkHoursTableProps {
  workHours: WorkHour[];
  onEdit: (workHour: WorkHour) => void;
  onDelete: (workHour: WorkHour) => void;
  pendingId?: string | null;
}

export function WorkHoursTable({ workHours, onEdit, onDelete, pendingId }: WorkHoursTableProps): JSX.Element {
  if (!workHours.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        Nenhum horário configurado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dia</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Início</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fim</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Criado em</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {workHours.map((item) => (
            <tr key={item.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 text-sm font-medium text-foreground">{WEEKDAYS[item.weekday]}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{item.startTime.slice(0, 5)}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{item.endTime.slice(0, 5)}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {formatInTimeZone(new Date(item.createdAt), DEFAULT_TIMEZONE, 'dd/MM/yyyy HH:mm')}
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(item)} disabled={pendingId === item.id}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
