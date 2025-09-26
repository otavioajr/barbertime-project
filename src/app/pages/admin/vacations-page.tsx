export function AdminVacationsPage(): JSX.Element {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Férias e fechamentos</h1>
        <p className="text-sm text-muted-foreground">
          Registre intervalos de indisponibilidade para impedir novos agendamentos nesses períodos.
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        O componente VacationRangePicker será adicionado aqui. Integrações com policies RLS garantirão que somente admins possam alterar estes dados.
      </div>
    </section>
  );
}
