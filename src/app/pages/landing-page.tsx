export function LandingPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted">
      <div className="max-w-2xl px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Barbearia moderna com agendamento simples
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Reserve seu horário em poucos passos e receba lembretes automáticos. Nenhum cadastro é necessário para clientes.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/agendar"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            Agendar agora
          </a>
          <a
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-base font-semibold text-foreground transition hover:bg-muted"
          >
            Área do administrador
          </a>
        </div>
      </div>
    </div>
  );
}
