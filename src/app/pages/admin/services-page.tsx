export function AdminServicesPage(): JSX.Element {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
        <p className="text-sm text-muted-foreground">
          Configure duração, preço e disponibilidade de cada serviço oferecido na barbearia.
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        A tabela de serviços será implementada com formulários validados por Zod. CRUD real será conectado ao Supabase.
      </div>
    </section>
  );
}
