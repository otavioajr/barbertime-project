import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/services', label: 'Serviços' },
  { to: '/admin/schedule', label: 'Horários' },
  { to: '/admin/vacations', label: 'Férias' },
  { to: '/admin/appointments', label: 'Agendamentos' },
];

export function AdminLayout(): JSX.Element {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background">
      <aside className="hidden border-r bg-card/30 md:block">
        <div className="flex h-16 items-center border-b px-6 text-lg font-semibold">Painel</div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="text-lg font-semibold">BarberTime Admin</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>admin@barbertime.app</span>
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto w-full max-w-5xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
