import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Vacation } from '@/lib/types';

import {
  useAdminVacations,
  useCreateVacation,
  useDeleteVacation,
  useUpdateVacation,
} from '@/features/admin/vacations/hooks';
import type { VacationFormValues } from '@/features/admin/vacations/vacation-schema';
import { VacationForm } from '@/features/admin/vacations/vacation-form';
import { VacationsTable } from '@/features/admin/vacations/vacations-table';

export function AdminVacationsPage(): JSX.Element {
  const { data: vacations = [], isLoading, isError, error } = useAdminVacations();
  const createVacation = useCreateVacation();
  const updateVacation = useUpdateVacation();
  const deleteVacation = useDeleteVacation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<Vacation | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditingVacation(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (vacation: Vacation) => {
    setEditingVacation(vacation);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingVacation(null);
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleSubmit = async (values: VacationFormValues) => {
    try {
      setFormError(null);
      if (editingVacation) {
        await updateVacation.mutateAsync({ id: editingVacation.id, payload: values });
      } else {
        await createVacation.mutateAsync(values);
      }
      closeForm();
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Não foi possível salvar o período. Tente novamente.',
      );
    }
  };

  const handleDelete = async (vacation: Vacation) => {
    const confirmed = window.confirm('Deseja remover este período de férias/fechamento?');
    if (!confirmed) {
      return;
    }

    try {
      setPendingId(vacation.id);
      await deleteVacation.mutateAsync(vacation.id);
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Não foi possível remover o período. Tente novamente.',
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Férias e fechamentos</h1>
          <p className="text-sm text-muted-foreground">
            Bloqueie intervalos em que a barbearia não estará disponível para reserva.
          </p>
        </div>
        <Button onClick={openCreateForm}>Novo período</Button>
      </header>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
          Carregando períodos...
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Não foi possível carregar os períodos.'}
        </div>
      ) : (
        <VacationsTable vacations={vacations} onEdit={openEditForm} onDelete={handleDelete} pendingId={pendingId} />
      )}

      {isFormOpen ? (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {editingVacation ? 'Editar período' : 'Cadastrar novo período'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Datas selecionadas não estarão disponíveis para novos agendamentos.
              </p>
            </div>
          </div>

          {formError ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <VacationForm
            initialValues={editingVacation}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            submitting={createVacation.isPending || updateVacation.isPending}
          />
        </div>
      ) : null}
    </div>
  );
}
