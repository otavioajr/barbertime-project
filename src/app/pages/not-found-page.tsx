import { Link } from 'react-router-dom';

export function NotFoundPage(): JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Página não encontrada</h1>
        <p className="text-base text-muted-foreground">
          O endereço acessado não existe. Volte para a página inicial ou tente outra seção.
        </p>
      </div>
      <Link
        className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        to="/"
      >
        Ir para início
      </Link>
    </div>
  );
}
