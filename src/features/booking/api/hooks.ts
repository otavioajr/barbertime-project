import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AvailabilitySlot } from '@/features/availability/types';

import { createAppointment, type CreateAppointmentPayload } from './create-appointment';
import { fetchAvailability } from './availability';
import { fetchServices } from './service';
import { bookingKeys } from './query-keys';
import type { Service } from '@/lib/types';
import { DEFAULT_TIMEZONE } from '../constants';

export function useServices() {
  return useQuery<Service[]>({
    queryKey: bookingKeys.services(),
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 5,
  });
}

interface UseAvailabilityArgs {
  serviceId?: string | null;
  startDate: string;
  days?: number;
  timezone?: string;
}

export function useAvailability({ serviceId, startDate, days = 1, timezone = DEFAULT_TIMEZONE }: UseAvailabilityArgs) {
  return useQuery<AvailabilitySlot[]>({
    queryKey: serviceId
      ? bookingKeys.availability({ serviceId, startDate, days, timezone })
      : [...bookingKeys.all, 'availability', 'disabled'],
    queryFn: () =>
      fetchAvailability({
        serviceId: serviceId as string,
        startDate,
        days,
        timezone,
      }),
    enabled: Boolean(serviceId),
    staleTime: 1000 * 30,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: bookingKeys.createAppointment(),
    mutationFn: (payload: CreateAppointmentPayload) => createAppointment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(
        bookingKeys.availability({
          serviceId: variables.serviceId,
          startDate: variables.startsAt.slice(0, 10),
          days: 1,
          timezone: DEFAULT_TIMEZONE,
        }),
      );
    },
  });
}
