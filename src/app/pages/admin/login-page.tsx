import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useSupabaseSession } from '@/lib/supabase/session';

export function AdminLoginPage(): JSX.Element {
  const { session, loading } = useSupabaseSession();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  if (!loading && session) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setStatus('sending');

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      setStatus('idle');
      setMessage(error.message ?? 'Falha ao enviar o link de acesso.');
      return;
    }

    setStatus('sent');
    setMessage('Enviamos um link mágico para o seu e-mail. Verifique a caixa de entrada.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Informe seu e-mail corporativo para receber um link de acesso seguro.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-email">E-mail</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="voce@barbertime.app"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!email || status === 'sending'}>
            {status === 'sending' ? 'Enviando link...' : 'Enviar link de acesso'}
          </Button>
        </form>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Para desenvolvimento local, adicione o e-mail desejado em `profiles` com `is_admin = true` após executar as migrations.
          </p>
          {message ? (
            <p className={status === 'sent' ? 'text-emerald-600' : 'text-destructive'}>{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
