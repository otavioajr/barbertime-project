import type { AppointmentStatus } from '@/lib/types';

export type AvailabilityStatus = 'available' | 'booked' | 'blocked';

export type AvailabilityReason =
  | 'appointment'
  | 'vacation'
  | 'outside-working-hours'
  | 'service-inactive'
  | 'lead-time'
  | 'max-advance';

export interface AvailabilitySlot {
  id: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: AvailabilityStatus;
  reason?: AvailabilityReason;
  appointmentId?: string;
}

export interface AvailabilityRules {
  timezone?: string;
  intervalMinutes?: number;
  minLeadMinutes?: number;
  maxAdvanceDays?: number;
  blockingStatuses?: AppointmentStatus[];
}
