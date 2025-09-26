import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Service } from '@/lib/types';

import {
  useAdminServices,
  useCreateService,
  useToggleServiceStatus,
  useUpdateService,
} from '@/features/admin/services/hooks';
import type { ServiceFormValues } from '@/features/admin/services/service-schema';
import { ServiceForm } from '@/features/admin/services/service-form';
import { ServicesTable } from '@/features/admin/services/services-table';

export function AdminServicesPage(): JSX.Element {
  const { data: services = [], isLoading, isError, error } = useAdminServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const toggleServiceStatus = useToggleServiceStatus();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditingService(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (service: Service) => {
    setEditingService(service);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
    setFormError(null);
  };

  const handleSubmit = async (values: ServiceFormValues) => {
    try {
      setFormError(null);
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          payload: {
            name: values.name,
            durationMin: values.durationMin,
            priceCents: values.priceCents,
            active: values.active,
          },
        });
      } else {
        await createService.mutateAsync({
          name: values.name,
          durationMin: values.durationMin,
          priceCents: values.priceCents,
          active: values.active,
        });
      }
      closeForm();
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error ? mutationError.message : 'Não foi possível salvar o serviço. Tente novamente.',
      );
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      setPendingServiceId(service.id);
      await toggleServiceStatus.mutateAsync({ id: service.id, active: !service.active });
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Não foi possível atualizar o status do serviço.',
      );
    } finally {
      setPendingServiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre e gerencie os serviços disponíveis para os clientes durante o fluxo de agendamento.
          </p>
        </div>
        <Button onClick={openCreateForm}>Novo serviço</Button>
      </header>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
          Carregando serviços...
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Não foi possível carregar os serviços.'}
        </div>
      ) : (
        <ServicesTable
          services={services}
          onEdit={openEditForm}
          onToggleStatus={handleToggleStatus}
          pendingServiceId={pendingServiceId}
        />
      )}

      {isFormOpen ? (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {editingService ? 'Editar serviço' : 'Cadastrar novo serviço'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Defina nome, duração e preço para controlar a oferta no fluxo do cliente.
              </p>
            </div>
          </div>

          {formError ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <ServiceForm
            initialValues={editingService}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            submitting={createService.isPending || updateService.isPending}
          />
        </div>
      ) : null}
    </div>
  );
}
