import { BadgeCheck, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Service } from '@/lib/types';

interface ServiceCardProps {
  service: Service;
  isSelected?: boolean;
  onSelect?: (serviceId: string) => void;
}

function formatCurrency(cents?: number | null): string {
  if (!cents) {
    return 'Sob consulta';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function ServiceCard({ service, isSelected = false, onSelect }: ServiceCardProps): JSX.Element {
  return (
    <Card className={`relative transition ${isSelected ? 'border-primary shadow-md' : 'hover:border-foreground/30'}`}>
      {isSelected ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
          <BadgeCheck className="h-3 w-3" /> Selecionado
        </span>
      ) : null}
      <CardHeader className="space-y-1">
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>Duração aproximada: {service.durationMin} minutos</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" aria-hidden />
          <span>{service.durationMin} min.</span>
        </div>
        <div className="text-base font-semibold text-foreground">{formatCurrency(service.priceCents)}</div>
      </CardContent>
      <CardContent className="pt-0">
        <Button className="w-full" variant={isSelected ? 'secondary' : 'default'} onClick={() => onSelect?.(service.id)}>
          {isSelected ? 'Escolhido' : 'Selecionar'}
        </Button>
      </CardContent>
    </Card>
  );
}
