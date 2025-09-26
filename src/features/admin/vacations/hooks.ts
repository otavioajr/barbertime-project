import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Vacation } from '@/lib/types';

import { createVacation, deleteVacation, fetchVacations, updateVacation } from './api';
import type { VacationFormValues } from './vacation-schema';

const VACATIONS_KEY = ['admin', 'vacations'] as const;

export function useAdminVacations() {
  return useQuery<Vacation[]>({
    queryKey: VACATIONS_KEY,
    queryFn: fetchVacations,
    staleTime: 1000 * 30,
  });
}

export function useCreateVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VacationFormValues) => createVacation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VACATIONS_KEY });
    },
  });
}

export function useUpdateVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VacationFormValues }) => updateVacation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VACATIONS_KEY });
    },
  });
}

export function useDeleteVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVacation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VACATIONS_KEY });
    },
  });
}
