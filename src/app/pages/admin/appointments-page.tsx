export function AdminAppointmentsPage(): JSX.Element {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Agendamentos</h1>
        <p className="text-sm text-muted-foreground">
          Consulte, filtre e gerencie agendamentos existentes. Cancelamentos e confirmações serão tratados via edge functions.
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        Lista e filtros em desenvolvimento. Integração com TanStack Query e Supabase virão em seguida.
      </div>
    </section>
  );
}
