import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Appointment } from '@/lib/types';

import { executeAppointmentAction, fetchAppointments } from './api';
import type { AppointmentActionPayload, AppointmentFilterValues } from './appointments-schema';

const APPOINTMENTS_KEY = ['admin', 'appointments'] as const;

export function useAdminAppointments(filters: AppointmentFilterValues) {
  return useQuery<Appointment[]>({
    queryKey: [...APPOINTMENTS_KEY, filters],
    queryFn: () => fetchAppointments(filters),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });
}

export function useAppointmentAction(filters: AppointmentFilterValues) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AppointmentActionPayload) => executeAppointmentAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_KEY, filters] });
    },
  });
}
