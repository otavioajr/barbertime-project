import { describe, expect, it } from 'vitest';

import { appointmentFilterSchema } from './appointments-schema';

describe('appointmentFilterSchema', () => {
  it('accepts empty strings for date filters as undefined', () => {
    const result = appointmentFilterSchema.parse({
      status: 'all',
      search: '',
      from: '',
      to: '',
    });

    expect(result.from).toBeUndefined();
    expect(result.to).toBeUndefined();
  });

  it('keeps valid date strings when provided', () => {
    const result = appointmentFilterSchema.parse({
      status: 'all',
      search: '',
      from: '2024-01-10',
      to: '2024-01-11',
    });

    expect(result.from).toBe('2024-01-10');
    expect(result.to).toBe('2024-01-11');
  });
});
