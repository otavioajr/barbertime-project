import { addDays, addMinutes, areIntervalsOverlapping, eachDayOfInterval } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

import type { Appointment, AppointmentStatus, Service, Vacation, WorkHour } from '@/lib/types';

import type { AvailabilityRules, AvailabilitySlot } from './types';

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
const DEFAULT_BLOCKING_STATUSES: AppointmentStatus[] = ['scheduled', 'confirmed'];

interface DateRange {
  start: Date | string;
  end: Date | string;
}

export interface GenerateAvailabilityParams {
  service: Pick<Service, 'id' | 'durationMin' | 'active'>;
  workHours: Array<Pick<WorkHour, 'weekday' | 'startTime' | 'endTime' | 'active'>>;
  appointments: Array<Pick<Appointment, 'id' | 'serviceId' | 'startsAt' | 'endsAt' | 'status'>>;
  vacations: Array<Pick<Vacation, 'id' | 'startsOn' | 'endsOn'>>;
  dateRange: DateRange;
  rules?: AvailabilityRules;
  now?: Date | string;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function parseTime(time: string): string {
  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00`;
  }
  return time;
}

function createWindowBoundary(date: Date, time: string, timezone: string): Date {
  const normalizedTime = parseTime(time);
  const dateString = formatInTimeZone(date, timezone, 'yyyy-MM-dd');
  return fromZonedTime(`${dateString}T${normalizedTime}`, timezone);
}

function getWeekday(date: Date, timezone: string): number {
  const isoDay = Number(formatInTimeZone(date, timezone, 'i'));
  return isoDay === 7 ? 0 : isoDay;
}

function isWithinLeadTime(slotStart: Date, now: Date, minLeadMinutes?: number): boolean {
  if (!minLeadMinutes) {
    return false;
  }
  const threshold = addMinutes(now, minLeadMinutes);
  return slotStart < threshold;
}

function exceedsMaxAdvance(slotStart: Date, now: Date, maxAdvanceDays?: number): boolean {
  if (!maxAdvanceDays) {
    return false;
  }
  const limit = addDays(now, maxAdvanceDays);
  return slotStart > limit;
}

function isWithinVacation(
  slotInterval: { start: Date; end: Date },
  vacations: GenerateAvailabilityParams['vacations'],
  timezone: string,
): boolean {
  return vacations.some((vacation) => {
    const vacationStart = fromZonedTime(`${vacation.startsOn}T00:00:00`, timezone);
    const vacationEnd = fromZonedTime(`${vacation.endsOn}T23:59:59.999`, timezone);
    return areIntervalsOverlapping(slotInterval, { start: vacationStart, end: vacationEnd }, { inclusive: true });
  });
}

function findBlockingAppointment(
  slotInterval: { start: Date; end: Date },
  appointments: GenerateAvailabilityParams['appointments'],
  blockingStatuses: AppointmentStatus[],
): { appointmentId: string } | null {
  for (const appointment of appointments) {
    if (!blockingStatuses.includes(appointment.status)) {
      continue;
    }
    const appointmentInterval = {
      start: new Date(appointment.startsAt),
      end: new Date(appointment.endsAt),
    };
    if (areIntervalsOverlapping(slotInterval, appointmentInterval, { inclusive: false })) {
      return { appointmentId: appointment.id };
    }
  }

  return null;
}

export function generateAvailabilitySlots({
  service,
  workHours,
  appointments,
  vacations,
  dateRange,
  rules,
  now,
}: GenerateAvailabilityParams): AvailabilitySlot[] {
  if (!service.active) {
    return [];
  }

  const timezone = rules?.timezone ?? DEFAULT_TIMEZONE;
  const minLeadMinutes = rules?.minLeadMinutes;
  const maxAdvanceDays = rules?.maxAdvanceDays;
  const intervalMinutes = rules?.intervalMinutes ?? 0;
  const blockingStatuses = rules?.blockingStatuses ?? DEFAULT_BLOCKING_STATUSES;

  const startDate = toDate(dateRange.start);
  const endDate = toDate(dateRange.end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
    return [];
  }

  const referenceNow = now ? toDate(now) : new Date();

  const activeWorkHours = workHours.filter((workHour) => workHour.active);

  if (!activeWorkHours.length) {
    return [];
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const slots: AvailabilitySlot[] = [];

  for (const day of days) {
    const weekday = getWeekday(day, timezone);

    const dayWorkHours = activeWorkHours.filter((workHour) => workHour.weekday === weekday);
    if (!dayWorkHours.length) {
      continue;
    }

    for (const window of dayWorkHours) {
      const windowStart = createWindowBoundary(day, window.startTime, timezone);
      const windowEnd = createWindowBoundary(day, window.endTime, timezone);

      if (windowEnd <= windowStart) {
        continue;
      }

      let slotStart = windowStart;

      while (true) {
        const slotEnd = addMinutes(slotStart, service.durationMin);

        if (slotEnd > windowEnd) {
          break;
        }

        const slotInterval = { start: slotStart, end: slotEnd };
        let status: AvailabilitySlot['status'] = 'available';
        let reason: AvailabilitySlot['reason'];
        let appointmentId: string | undefined;

        if (isWithinLeadTime(slotStart, referenceNow, minLeadMinutes)) {
          status = 'blocked';
          reason = 'lead-time';
        } else if (exceedsMaxAdvance(slotStart, referenceNow, maxAdvanceDays)) {
          status = 'blocked';
          reason = 'max-advance';
        } else {
          const blockingAppointment = findBlockingAppointment(slotInterval, appointments, blockingStatuses);
          if (blockingAppointment) {
            status = 'booked';
            reason = 'appointment';
            appointmentId = blockingAppointment.appointmentId;
          } else if (isWithinVacation(slotInterval, vacations, timezone)) {
            status = 'blocked';
            reason = 'vacation';
          }
        }

        slots.push({
          id: `${service.id}-${slotStart.toISOString()}`,
          serviceId: service.id,
          startsAt: slotStart.toISOString(),
          endsAt: slotEnd.toISOString(),
          status,
          reason,
          appointmentId,
        });

        slotStart = addMinutes(slotStart, service.durationMin + intervalMinutes);
        if (slotStart >= windowEnd) {
          break;
        }
      }
    }
  }

  return slots.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}
