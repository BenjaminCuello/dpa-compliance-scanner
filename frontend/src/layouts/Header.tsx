import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <span className="font-semibold text-slate-900">
        DPA Compliance Scanner
      </span>

      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-slate-600">{user.name}</span>}
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
