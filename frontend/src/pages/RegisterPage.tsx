import { ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { extractErrorMessage } from '../lib/http/apiError';
import { useAuth } from '../features/auth/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-soft p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-md border border-border bg-surface p-8"
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <ShieldCheck size={20} className="text-accent" />
          <span className="text-sm font-semibold text-text">
            DPA Compliance Scanner
          </span>
        </div>

        <h1 className="text-xl font-semibold text-text">Crear cuenta</h1>

        {error && (
          <p className="rounded-md border border-critical/20 bg-critical/10 p-2 text-sm text-critical">
            {error}
          </p>
        )}

        <label className="block text-sm font-medium text-text">
          Nombre completo
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-text">
          Correo electrónico
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-text">
          Contraseña
          <input
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
          />
          <span className="mt-1 block text-xs text-text-muted">
            Mínimo 10 caracteres, con una mayúscula, una minúscula y un número.
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
