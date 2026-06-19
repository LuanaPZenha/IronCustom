import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../services/api';
import { MOTO_IMAGES, cardImage } from '../utils/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import WorkshopBackground from '../components/WorkshopBackground';
import ImageCard from '../components/ImageCard';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <WorkshopBackground />

      {/* Painel com foto de moto custom — desktop */}
      <div className="login-moto-panel">
        <div
          className="login-moto-image"
          style={{ backgroundImage: `url(${MOTO_IMAGES.login})` }}
        />
        <div className="login-moto-overlay absolute inset-0" />
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <p className="font-display text-6xl leading-none tracking-wider text-white drop-shadow-2xl">
            IRON<br />CUSTOM
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300 drop-shadow">
            Oficina especializada em motos custom — cafe racer, bobber, scrambler e projetos únicos.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10">
        {/* Foto mobile de fundo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 lg:hidden"
          style={{ backgroundImage: `url(${MOTO_IMAGES.login})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-workshop-950/80 via-workshop-950/95 to-workshop-950 lg:hidden" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="font-display text-5xl tracking-wider text-workshop-accent">IRON CUSTOM</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.3em] text-zinc-500">Oficina de Motos Custom</p>
          </div>

          <ImageCard image={cardImage(11)} className="border-workshop-accent/20 shadow-glow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Acesso ao sistema</h2>
              <p className="mt-1 text-sm text-zinc-400">Entre com suas credenciais para continuar</p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-200" role="alert">
                {error}
              </div>
            )}

            <Input
              label="E-mail"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />

            <Input
              label="Senha"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar na Oficina'}
            </Button>

            <p className="text-center text-xs text-zinc-500">
              Admin: admin@example.com / Admin1234
            </p>
            </form>
          </ImageCard>
        </div>
      </div>
    </div>
  );
}
