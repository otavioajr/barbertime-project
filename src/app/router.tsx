import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AdminLayout } from './layouts/admin-layout';
import { RootLayout } from './layouts/root-layout';
import { AdminAppointmentsPage } from './pages/admin/appointments-page';
import { AdminDashboardPage } from './pages/admin/dashboard-page';
import { AdminLoginPage } from './pages/admin/login-page';
import { AdminSchedulePage } from './pages/admin/schedule-page';
import { AdminServicesPage } from './pages/admin/services-page';
import { AdminVacationsPage } from './pages/admin/vacations-page';
import { AppointmentDetailPage } from './pages/appointment-detail-page';
import { BookingFlowPage } from './pages/booking-flow-page';
import { LandingPage } from './pages/landing-page';
import { NotFoundPage } from './pages/not-found-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'agendar', element: <BookingFlowPage /> },
      { path: 'agendamento/:token', element: <AppointmentDetailPage /> },
      { path: 'admin/login', element: <AdminLoginPage /> },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'services', element: <AdminServicesPage /> },
          { path: 'schedule', element: <AdminSchedulePage /> },
          { path: 'vacations', element: <AdminVacationsPage /> },
          { path: 'appointments', element: <AdminAppointmentsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
