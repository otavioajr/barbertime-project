export function AdminSchedulePage(): JSX.Element {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Horários de trabalho</h1>
        <p className="text-sm text-muted-foreground">
          Defina janelas de atendimento por dia da semana. Validaremos intervalos e colisões em breve.
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
        Editor de faixas de horário pendente. Este espaço receberá componentes como TimeRangeEditor e SlotPreview.
      </div>
    </section>
  );
}
