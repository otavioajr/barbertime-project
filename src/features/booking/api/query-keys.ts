export const bookingKeys = {
  all: ['booking'] as const,
  services: () => [...bookingKeys.all, 'services'] as const,
  availability: (args: { serviceId: string; startDate: string; days: number; timezone: string }) =>
    [...bookingKeys.all, 'availability', args] as const,
  createAppointment: () => [...bookingKeys.all, 'create-appointment'] as const,
};
