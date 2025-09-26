import { addDays, addMinutes, areIntervalsOverlapping, eachDayOfInterval } from 'npm:date-fns@4.1.0';
import { formatInTimeZone, fromZonedTime } from 'npm:date-fns-tz@3.2.0';

import type { Database } from '../../types.ts';

export type DbService = Database['public']['Tables']['services']['Row'];
export type DbAppointment = Database['public']['Tables']['appointments']['Row'];
export type DbWorkHour = Database['public']['Tables']['work_hours']['Row'];
export type DbVacation = Database['public']['Tables']['vacations']['Row'];

export type AvailabilityStatus = 'available' | 'booked' | 'blocked';

export interface AvailabilitySlot {
  id: string;
  startsAt: string;
  endsAt: string;
  status: AvailabilityStatus;
  reason?:
    | 'lead-time'
    | 'max-advance'
    | 'appointment'
    | 'vacation'
    | 'outside-working-hours'
    | 'service-inactive';
  appointmentId?: string;
}

export interface SlotRules {
  timezone: string;
  minLeadMinutes?: number;
  maxAdvanceDays?: number;
  intervalMinutes?: number;
  blockingStatuses?: Array<Database['public']['Enums']['appointment_status']>;
}

const DEFAULT_BLOCKING_STATUSES: Array<Database['public']['Enums']['appointment_status']> = [
  'scheduled',
  'confirmed',
];

export interface SlotGenerationInput {
  service: DbService;
  workHours: DbWorkHour[];
  vacations: DbVacation[];
  appointments: DbAppointment[];
  dateRange: { start: Date; end: Date };
  rules: SlotRules;
  now: Date;
}

function parseTime(time: string): string {
  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00`;
  }
  return time;
}

function createBoundary(date: Date, time: string, timezone: string): Date {
  const normalized = parseTime(time);
  const dateString = formatInTimeZone(date, timezone, 'yyyy-MM-dd');
  return fromZonedTime(`${dateString}T${normalized}`, timezone);
}

function getWeekday(date: Date, timezone: string): number {
  const isoDay = Number(formatInTimeZone(date, timezone, 'i'));
  return isoDay === 7 ? 0 : isoDay;
}

function withinLeadTime(start: Date, now: Date, minLeadMinutes?: number): boolean {
  if (!minLeadMinutes) return false;
  const threshold = addMinutes(now, minLeadMinutes);
  return start < threshold;
}

function exceedsAdvance(start: Date, now: Date, maxAdvanceDays?: number): boolean {
  if (!maxAdvanceDays) return false;
  const limit = addDays(now, maxAdvanceDays);
  return start > limit;
}

function intersectsVacation(interval: { start: Date; end: Date }, vacations: DbVacation[], timezone: string): boolean {
  return vacations.some((vacation) => {
    const vacationStart = fromZonedTime(`${vacation.starts_on}T00:00:00`, timezone);
    const vacationEnd = fromZonedTime(`${vacation.ends_on}T23:59:59.999`, timezone);
    return areIntervalsOverlapping(interval, { start: vacationStart, end: vacationEnd }, { inclusive: true });
  });
}

function findBlockingAppointment(
  interval: { start: Date; end: Date },
  appointments: DbAppointment[],
  statuses: Array<Database['public']['Enums']['appointment_status']>,
): { appointmentId: string } | null {
  for (const appointment of appointments) {
    if (!statuses.includes(appointment.status)) continue;
    const appointmentInterval = { start: new Date(appointment.starts_at), end: new Date(appointment.ends_at) };
    if (areIntervalsOverlapping(interval, appointmentInterval, { inclusive: false })) {
      return { appointmentId: appointment.id };
    }
  }
  return null;
}

export function generateSlots({
  service,
  workHours,
  vacations,
  appointments,
  dateRange,
  rules,
  now,
}: SlotGenerationInput): AvailabilitySlot[] {
  if (!service.active) {
    return [];
  }

  const timezone = rules.timezone;
  const intervalMinutes = rules.intervalMinutes ?? 0;
  const blockingStatuses = rules.blockingStatuses ?? DEFAULT_BLOCKING_STATUSES;

  const activeWindows = workHours.filter((wh) => wh.active);
  if (!activeWindows.length) {
    return [];
  }

  const days = eachDayOfInterval(dateRange);
  const slots: AvailabilitySlot[] = [];

  for (const day of days) {
    const weekday = getWeekday(day, timezone);
    const windows = activeWindows.filter((wh) => wh.weekday === weekday);
    if (!windows.length) continue;

    for (const window of windows) {
      const windowStart = createBoundary(day, window.start_time, timezone);
      const windowEnd = createBoundary(day, window.end_time, timezone);
      if (windowEnd <= windowStart) continue;

      let cursor = windowStart;

      while (true) {
        const slotEnd = addMinutes(cursor, service.duration_min);
        if (slotEnd > windowEnd) {
          break;
        }

        const interval = { start: cursor, end: slotEnd };
        let status: AvailabilityStatus = 'available';
        let reason: AvailabilitySlot['reason'];
        let appointmentId: string | undefined;

        if (withinLeadTime(cursor, now, rules.minLeadMinutes)) {
          status = 'blocked';
          reason = 'lead-time';
        } else if (exceedsAdvance(cursor, now, rules.maxAdvanceDays)) {
          status = 'blocked';
          reason = 'max-advance';
        } else {
          const blocking = findBlockingAppointment(interval, appointments, blockingStatuses);
          if (blocking) {
            status = 'booked';
            reason = 'appointment';
            appointmentId = blocking.appointmentId;
          } else if (intersectsVacation(interval, vacations, timezone)) {
            status = 'blocked';
            reason = 'vacation';
          }
        }

        slots.push({
          id: `${service.id}-${cursor.toISOString()}`,
          startsAt: cursor.toISOString(),
          endsAt: slotEnd.toISOString(),
          status,
          reason,
          appointmentId,
        });

        cursor = addMinutes(cursor, service.duration_min + intervalMinutes);
        if (cursor >= windowEnd) break;
      }
    }
  }

  return slots.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function findSlot(slots: AvailabilitySlot[], startsAt: string): AvailabilitySlot | undefined {
  return slots.find((slot) => slot.startsAt === new Date(startsAt).toISOString());
}
