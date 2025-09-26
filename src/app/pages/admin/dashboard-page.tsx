export function AdminDashboardPage(): JSX.Element {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral de agendamentos futuros, métricas e ocupação. Integrações reais serão conectadas após modelagem Supabase.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-dashed border-muted bg-card p-4 text-muted-foreground"
          >
            Card de métrica #{item}
          </div>
        ))}
      </div>
    </section>
  );
}
