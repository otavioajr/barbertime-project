import { addDays, addMinutes, format } from 'date-fns';

import { generateAvailabilitySlots } from '@/features/availability/slot-generator';
import type { AvailabilitySlot } from '@/features/availability/types';
import type { Appointment, Service, Vacation, WorkHour } from '@/lib/types';

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

const referenceNow = new Date();
const startOfToday = new Date(referenceNow);
startOfToday.setHours(0, 0, 0, 0);

function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function iso(date: Date): string {
  return date.toISOString();
}

export const mockServices: Service[] = [
  {
    id: 'corte-classico',
    name: 'Corte Clássico',
    durationMin: 30,
    priceCents: 4500,
    active: true,
    createdAt: iso(referenceNow),
  },
  {
    id: 'corte-barba',
    name: 'Corte + Barba',
    durationMin: 60,
    priceCents: 8000,
    active: true,
    createdAt: iso(referenceNow),
  },
  {
    id: 'barba-detalhada',
    name: 'Barba Detalhada',
    durationMin: 45,
    priceCents: 5500,
    active: true,
    createdAt: iso(referenceNow),
  },
];

export const mockWorkHours: WorkHour[] = [
  { id: 'mon-morning', weekday: 1, startTime: '09:00:00', endTime: '12:00:00', active: true, createdAt: iso(referenceNow) },
  { id: 'mon-afternoon', weekday: 1, startTime: '13:30:00', endTime: '18:00:00', active: true, createdAt: iso(referenceNow) },
  { id: 'tue-full', weekday: 2, startTime: '09:00:00', endTime: '18:00:00', active: true, createdAt: iso(referenceNow) },
  { id: 'wed-morning', weekday: 3, startTime: '09:00:00', endTime: '12:00:00', active: true, createdAt: iso(referenceNow) },
];

export const mockVacations: Vacation[] = [
  {
    id: 'maintenance-day',
    startsOn: toDateString(addDays(startOfToday, 2)),
    endsOn: toDateString(addDays(startOfToday, 2)),
    reason: 'Manutenção do espaço',
    createdAt: iso(referenceNow),
  },
];

const appointment1Start = new Date(startOfToday);
appointment1Start.setHours(13, 30, 0, 0);
const appointment1End = addMinutes(new Date(appointment1Start), 30);

const appointment2Start = addDays(new Date(startOfToday), 1);
appointment2Start.setHours(11, 0, 0, 0);
const appointment2End = addMinutes(new Date(appointment2Start), 60);

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    serviceId: 'corte-classico',
    startsAt: iso(appointment1Start),
    endsAt: iso(appointment1End),
    customerName: 'João Silva',
    customerPhone: '+5511999999999',
    status: 'scheduled',
    publicToken: 'token-1',
    createdAt: iso(referenceNow),
  },
  {
    id: 'apt-2',
    serviceId: 'corte-barba',
    startsAt: iso(appointment2Start),
    endsAt: iso(appointment2End),
    customerName: 'Maria Souza',
    customerPhone: '+5511988888888',
    status: 'confirmed',
    publicToken: 'token-2',
    createdAt: iso(referenceNow),
  },
];

interface MockSlotOptions {
  days?: number;
  timezone?: string;
}

export function getMockSlotsForService(serviceId: string, options: MockSlotOptions = {}): AvailabilitySlot[] {
  const service = mockServices.find((item) => item.id === serviceId);
  if (!service) {
    return [];
  }

  const timezone = options.timezone ?? DEFAULT_TIMEZONE;
  const days = options.days ?? 3;

  const dateRange = {
    start: startOfToday,
    end: addDays(startOfToday, days),
  };

  return generateAvailabilitySlots({
    service,
    workHours: mockWorkHours,
    vacations: mockVacations,
    appointments: mockAppointments,
    dateRange,
    rules: {
      timezone,
      minLeadMinutes: 60,
      maxAdvanceDays: 30,
    },
    now: referenceNow,
  });
}
