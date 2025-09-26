import { useParams } from 'react-router-dom';

export function AppointmentDetailPage(): JSX.Element {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Detalhes do agendamento</h1>
        <p className="text-base text-muted-foreground">
          Esta página permitirá visualizar, confirmar ou cancelar o agendamento utilizando o token público gerado na criação do slot.
        </p>
      </header>
      <section className="rounded-lg border border-dashed border-muted p-6">
        <p className="text-muted-foreground">
          Token recebido: <span className="font-mono text-sm text-foreground">{token}</span>
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          O carregamento real dos dados será feito através de chamadas às edge functions do Supabase utilizando este identificador.
        </p>
      </section>
    </div>
  );
}
