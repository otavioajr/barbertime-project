import { NavLink, Outlet } from 'react-router-dom';

const navLinkClasses = 'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground';

export function RootLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <NavLink to="/" className="text-lg font-semibold text-foreground">
            BarberTime
          </NavLink>
          <nav className="flex items-center gap-2">
            <NavLink to="/agendar" className={({ isActive }) => `${navLinkClasses} ${isActive ? 'text-foreground' : ''}`}>
              Agendar
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `${navLinkClasses} ${isActive ? 'text-foreground' : ''}`}>
              Admin
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} BarberTime</span>
          <a className="hover:text-foreground" href="/agendar">
            Agendar horário
          </a>
        </div>
      </footer>
    </div>
  );
}
