import type { Service } from '@/lib/types';

import { ServiceCard } from './service-card';

interface ServiceListProps {
  services: Service[];
  selectedServiceId?: string | null;
  onSelect: (serviceId: string) => void;
}

export function ServiceList({ services, selectedServiceId, onSelect }: ServiceListProps): JSX.Element {
  if (!services.length) {
    return <p className="text-sm text-muted-foreground">Nenhum serviço disponível no momento.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} isSelected={service.id === selectedServiceId} onSelect={onSelect} />
      ))}
    </div>
  );
}
