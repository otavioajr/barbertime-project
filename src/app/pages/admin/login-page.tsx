export function AdminLoginPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Autentique-se com Supabase Auth para acessar o painel de configurações.
          </p>
        </div>
        <div className="rounded-md border border-dashed border-muted px-4 py-8 text-center text-sm text-muted-foreground">
          Formulário de login ainda não implementado. Conectaremos com Supabase Auth (magic link) nas próximas etapas.
        </div>
      </div>
    </div>
  );
}
