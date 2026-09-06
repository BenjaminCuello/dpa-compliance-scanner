import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../features/auth/useAuth';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-border bg-bg px-4">
      {user && <span className="text-sm text-text-muted">{user.name}</span>}

      <ThemeToggle />

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </header>
  );
}
