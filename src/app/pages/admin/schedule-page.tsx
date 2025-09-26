import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { WorkHour } from '@/lib/types';

import {
  useAdminWorkHours,
  useCreateWorkHour,
  useDeleteWorkHour,
  useUpdateWorkHour,
} from '@/features/admin/work-hours/hooks';
import type { WorkHourFormValues } from '@/features/admin/work-hours/work-hour-schema';
import { WorkHourForm } from '@/features/admin/work-hours/work-hour-form';
import { WorkHoursTable } from '@/features/admin/work-hours/work-hours-table';

export function AdminSchedulePage(): JSX.Element {
  const { data: workHours = [], isLoading, isError, error } = useAdminWorkHours();
  const createWorkHour = useCreateWorkHour();
  const updateWorkHour = useUpdateWorkHour();
  const deleteWorkHour = useDeleteWorkHour();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkHour, setEditingWorkHour] = useState<WorkHour | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditingWorkHour(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (workHour: WorkHour) => {
    setEditingWorkHour(workHour);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingWorkHour(null);
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleSubmit = async (values: WorkHourFormValues) => {
    try {
      setFormError(null);
      if (editingWorkHour) {
        await updateWorkHour.mutateAsync({ id: editingWorkHour.id, payload: values });
      } else {
        await createWorkHour.mutateAsync(values);
      }
      closeForm();
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Não foi possível salvar o horário. Tente novamente.',
      );
    }
  };

  const handleDelete = async (workHour: WorkHour) => {
    const confirmed = window.confirm('Deseja remover este horário de trabalho?');
    if (!confirmed) {
      return;
    }

    try {
      setPendingId(workHour.id);
      await deleteWorkHour.mutateAsync(workHour.id);
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Não foi possível remover o horário. Tente novamente.',
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Horários de trabalho</h1>
          <p className="text-sm text-muted-foreground">
            Configure janelas de atendimento por dia da semana para controlar a geração de disponibilidade.
          </p>
        </div>
        <Button onClick={openCreateForm}>Novo horário</Button>
      </header>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
          Carregando horários...
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Não foi possível carregar os horários.'}
        </div>
      ) : (
        <WorkHoursTable workHours={workHours} onEdit={openEditForm} onDelete={handleDelete} pendingId={pendingId} />
      )}

      {isFormOpen ? (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {editingWorkHour ? 'Editar horário' : 'Cadastrar novo horário'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Cada horário ativo será considerado na geração dos slots disponíveis.
              </p>
            </div>
          </div>

          {formError ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <WorkHourForm
            initialValues={editingWorkHour}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            submitting={createWorkHour.isPending || updateWorkHour.isPending}
          />
        </div>
      ) : null}
    </div>
  );
}
