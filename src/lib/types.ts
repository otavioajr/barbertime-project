export type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceCents?: number | null;
  active: boolean;
  createdAt: string;
};

export type WorkHour = {
  id: string;
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  active: boolean;
  createdAt: string;
};

export type Vacation = {
  id: string;
  startsOn: string; // ISO date
  endsOn: string; // ISO date
  reason?: string | null;
  createdAt: string;
};

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'canceled' | 'completed';

export type Appointment = {
  id: string;
  serviceId: string;
  startsAt: string; // ISO timestamp
  endsAt: string;
  customerName?: string | null;
  customerPhone: string;
  status: AppointmentStatus;
  publicToken: string;
  createdAt: string;
};

export type PushSubscription = {
  id: string;
  publicToken?: string | null;
  customerPhone?: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
};

export type AdminProfile = {
  id: string;
  isAdmin: boolean;
  createdAt: string;
};
