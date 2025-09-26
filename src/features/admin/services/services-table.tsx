import { ptBR } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

import { Button } from '@/components/ui/button';
import type { Service } from '@/lib/types';

import { DEFAULT_TIMEZONE } from '../../booking/constants';

interface ServicesTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  pendingServiceId?: string | null;
}

function formatPrice(priceCents?: number | null): string {
  if (priceCents === null || priceCents === undefined) {
    return '–';
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceCents / 100);
}

export function ServicesTable({ services, onEdit, onToggleStatus, pendingServiceId }: ServicesTableProps): JSX.Element {
  if (!services.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        Nenhum serviço cadastrado até o momento.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Serviço</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duração</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Preço</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Criado em</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {services.map((service) => {
            const createdLabel = formatInTimeZone(
              new Date(service.createdAt),
              DEFAULT_TIMEZONE,
              "d 'de' MMMM 'de' yyyy HH:mm",
              { locale: ptBR },
            );

            return (
              <tr key={service.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{service.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{service.durationMin} min</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatPrice(service.priceCents)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatInTimezone(service.createdAt)}
                  <span className="block text-[11px] uppercase text-muted-foreground/60">{createdLabel}</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      service.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {service.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(service)}
                      disabled={pendingServiceId === service.id}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={service.active ? 'ghost' : 'secondary'}
                      onClick={() => onToggleStatus(service)}
                      disabled={pendingServiceId === service.id}
                    >
                      {pendingServiceId === service.id
                        ? 'Processando...'
                        : service.active
                          ? 'Desativar'
                          : 'Ativar'}
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

function formatInTimezone(dateIso: string): string {
  return formatInTimeZone(new Date(dateIso), DEFAULT_TIMEZONE, 'dd/MM/yyyy HH:mm');
}
