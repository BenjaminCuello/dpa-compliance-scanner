import {
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../features/auth/useAuth';

const links = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/auditorias', label: 'Auditorías', icon: ClipboardCheck },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="flex w-56 shrink-0 flex-col bg-sidebar-bg p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <ShieldCheck size={20} className="text-accent" />
        <span className="text-sm font-semibold text-sidebar-text">
          DPA Compliance Scanner
        </span>
      </div>

      <ul className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-sidebar-text'
                    : 'text-sidebar-text-muted hover:bg-white/5 hover:text-sidebar-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-accent' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between px-2">
          {user && (
            <span className="truncate text-sm text-sidebar-text-muted">
              {user.name}
            </span>
          )}
          <ThemeToggle className="text-sidebar-text-muted hover:bg-white/5 hover:text-sidebar-text" />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium text-sidebar-text-muted transition-colors hover:bg-white/5 hover:text-sidebar-text"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
