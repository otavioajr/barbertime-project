import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { AvailabilityReason, AvailabilitySlot } from '@/features/availability/types';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  slots: AvailabilitySlot[];
  selectedSlotId?: string | null;
  onSelect: (slot: AvailabilitySlot) => void;
}

function slotLabel(slot: AvailabilitySlot): string {
  return `${format(new Date(slot.startsAt), 'HH:mm', { locale: ptBR })} - ${format(new Date(slot.endsAt), 'HH:mm', { locale: ptBR })}`;
}

function reasonLabel(reason?: AvailabilityReason): string {
  switch (reason) {
    case 'vacation':
      return 'Fechado (férias/feriado)';
    case 'appointment':
      return 'Horário reservado';
    case 'lead-time':
      return 'Prazo mínimo não alcançado';
    case 'max-advance':
      return 'Fora da janela permitida';
    case 'service-inactive':
      return 'Serviço inativo';
    default:
      return 'Indisponível';
  }
}

export function CalendarGrid({ slots, selectedSlotId, onSelect }: CalendarGridProps): JSX.Element {
  if (!slots.length) {
    return <p className="text-sm text-muted-foreground">Nenhum horário disponível para o serviço escolhido.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = slot.id === selectedSlotId;
        const isUnavailable = slot.status !== 'available';

        const title = isUnavailable ? reasonLabel(slot.reason) : undefined;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={isUnavailable}
            onClick={() => onSelect(slot)}
            className={cn(
              'flex h-20 flex-col items-center justify-center rounded-lg border text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isUnavailable && 'cursor-not-allowed border-dashed text-muted-foreground',
              slot.status === 'booked' && 'bg-muted/50',
              slot.status === 'blocked' && 'bg-muted/30',
              isSelected && 'border-primary bg-primary text-primary-foreground shadow',
            )}
            title={title}
          >
            <span className="font-semibold">{slotLabel(slot)}</span>
            <span className="mt-1 text-xs uppercase tracking-wide">
              {slot.status === 'available'
                ? 'Disponível'
                : slot.status === 'booked'
                  ? 'Ocupado'
                  : reasonLabel(slot.reason)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
