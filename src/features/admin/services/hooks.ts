import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Service } from '@/lib/types';

import { createService, fetchAllServices, toggleServiceStatus, updateService } from './api';
import type { ServiceFormValues } from './service-schema';

const servicesKey = ['admin', 'services'] as const;

export function useAdminServices() {
  return useQuery<Service[]>({
    queryKey: servicesKey,
    queryFn: fetchAllServices,
    staleTime: 1000 * 30,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ServiceFormValues) => createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKey });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ServiceFormValues }) => updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKey });
    },
  });
}

export function useToggleServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleServiceStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKey });
    },
  });
}
