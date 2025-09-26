import { describe, expect, it } from 'vitest';
import { formatInTimeZone } from 'date-fns-tz';

import { generateAvailabilitySlots } from './slot-generator';

const timezone = 'America/Sao_Paulo';

function createDate(value: string): Date {
  return new Date(value);
}

describe('generateAvailabilitySlots', () => {
  it('gera slots no intervalo configurado', () => {
    const startDate = createDate('2025-01-06T00:00:00-03:00');

    const slots = generateAvailabilitySlots({
      service: { id: 'svc', durationMin: 30, active: true },
      workHours: [{ id: 'wh', weekday: 1, startTime: '09:00:00', endTime: '12:00:00', active: true, createdAt: startDate.toISOString() }],
      appointments: [],
      vacations: [],
      dateRange: { start: startDate, end: startDate },
      now: createDate('2025-01-05T12:00:00-03:00'),
      rules: { timezone },
    });

    expect(slots).toHaveLength(6);
    expect(slots.every((slot) => slot.status === 'available')).toBe(true);
    expect(formatInTimeZone(new Date(slots[0]!.startsAt), timezone, 'HH:mm')).toBe('09:00');
  });

  it('marca horários ocupados por agendamentos como booked', () => {
    const startDate = createDate('2025-01-06T00:00:00-03:00');

    const slots = generateAvailabilitySlots({
      service: { id: 'svc', durationMin: 30, active: true },
      workHours: [{ id: 'wh', weekday: 1, startTime: '09:00:00', endTime: '12:00:00', active: true, createdAt: startDate.toISOString() }],
      appointments: [
        {
          id: 'apt-1',
          serviceId: 'svc',
          startsAt: '2025-01-06T09:30:00-03:00',
          endsAt: '2025-01-06T10:00:00-03:00',
          status: 'scheduled',
        },
      ],
      vacations: [],
      dateRange: { start: startDate, end: startDate },
      now: createDate('2025-01-05T12:00:00-03:00'),
      rules: { timezone },
    });

    const bookedSlot = slots.find((slot) => slot.status === 'booked');
    expect(bookedSlot).toBeDefined();
    expect(bookedSlot?.reason).toBe('appointment');
  });

  it('bloqueia slots em dias de férias/fechamento', () => {
    const startDate = createDate('2025-01-06T00:00:00-03:00');

    const slots = generateAvailabilitySlots({
      service: { id: 'svc', durationMin: 30, active: true },
      workHours: [{ id: 'wh', weekday: 1, startTime: '09:00:00', endTime: '11:00:00', active: true, createdAt: startDate.toISOString() }],
      appointments: [],
      vacations: [{ id: 'vac-1', startsOn: '2025-01-06', endsOn: '2025-01-06' }],
      dateRange: { start: startDate, end: startDate },
      now: createDate('2025-01-05T12:00:00-03:00'),
      rules: { timezone },
    });

    expect(slots).toHaveLength(4);
    expect(slots.every((slot) => slot.status === 'blocked' && slot.reason === 'vacation')).toBe(true);
  });

  it('respeita o prazo mínimo (lead time)', () => {
    const startDate = createDate('2025-01-06T00:00:00-03:00');

    const slots = generateAvailabilitySlots({
      service: { id: 'svc', durationMin: 30, active: true },
      workHours: [{ id: 'wh', weekday: 1, startTime: '09:00:00', endTime: '11:00:00', active: true, createdAt: startDate.toISOString() }],
      appointments: [],
      vacations: [],
      dateRange: { start: startDate, end: startDate },
      now: createDate('2025-01-06T08:30:00-03:00'),
      rules: { timezone, minLeadMinutes: 90 },
    });

    const blocked = slots.filter((slot) => slot.status === 'blocked' && slot.reason === 'lead-time');
    expect(blocked).toHaveLength(2);
    const blockedTimes = blocked.map((slot) => formatInTimeZone(new Date(slot.startsAt), timezone, 'HH:mm'));
    expect(blockedTimes).toStrictEqual(['09:00', '09:30']);
  });

  it('bloqueia slots fora da antecedência máxima', () => {
    const startDate = createDate('2025-01-06T00:00:00-03:00');
    const endDate = createDate('2025-02-10T00:00:00-03:00');

    const slots = generateAvailabilitySlots({
      service: { id: 'svc', durationMin: 30, active: true },
      workHours: [{ id: 'wh', weekday: 1, startTime: '09:00:00', endTime: '11:00:00', active: true, createdAt: startDate.toISOString() }],
      appointments: [],
      vacations: [],
      dateRange: { start: startDate, end: endDate },
      now: createDate('2025-01-06T08:30:00-03:00'),
      rules: { timezone, maxAdvanceDays: 14 },
    });

    const farSlots = slots.filter((slot) => slot.reason === 'max-advance');
    expect(farSlots.length).toBeGreaterThan(0);
    expect(farSlots.every((slot) => slot.status === 'blocked')).toBe(true);
  });

  it('retorna vazio quando o serviço está inativo', () => {
    const startDate = createDate('2025-01-06T00:00:00-03:00');

    const slots = generateAvailabilitySlots({
      service: { id: 'svc', durationMin: 30, active: false },
      workHours: [{ id: 'wh', weekday: 1, startTime: '09:00:00', endTime: '11:00:00', active: true, createdAt: startDate.toISOString() }],
      appointments: [],
      vacations: [],
      dateRange: { start: startDate, end: startDate },
      now: createDate('2025-01-05T12:00:00-03:00'),
      rules: { timezone },
    });

    expect(slots).toHaveLength(0);
  });
});
