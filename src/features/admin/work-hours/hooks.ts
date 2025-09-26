import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { WorkHour } from '@/lib/types';

import { createWorkHour, deleteWorkHour, fetchWorkHours, updateWorkHour } from './api';
import type { WorkHourFormValues } from './work-hour-schema';

const WORK_HOURS_KEY = ['admin', 'work-hours'] as const;

export function useAdminWorkHours() {
  return useQuery<WorkHour[]>({
    queryKey: WORK_HOURS_KEY,
    queryFn: fetchWorkHours,
    staleTime: 1000 * 30,
  });
}

export function useCreateWorkHour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkHourFormValues) => createWorkHour(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_HOURS_KEY });
    },
  });
}

export function useUpdateWorkHour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorkHourFormValues }) => updateWorkHour(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_HOURS_KEY });
    },
  });
}

export function useDeleteWorkHour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkHour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_HOURS_KEY });
    },
  });
}
