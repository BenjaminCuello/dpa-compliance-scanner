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

/** Bajo `md` el sidebar se reduce a íconos; los nombres quedan en `aria-label`. */
export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="flex w-16 shrink-0 flex-col bg-sidebar-bg p-2 md:w-56 md:p-4">
      <div className="mb-6 flex items-center justify-center gap-2 px-2 py-2 md:justify-start md:py-0">
        <ShieldCheck size={20} aria-hidden="true" className="text-accent" />
        <span className="hidden text-sm font-semibold text-sidebar-text md:inline">
          DPA Compliance Scanner
        </span>
      </div>

      <ul className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              aria-label={label}
              title={label}
              className={({ isActive }) =>
                `flex items-center justify-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors md:justify-start ${
                  isActive
                    ? 'bg-white/10 text-sidebar-text'
                    : 'text-sidebar-text-muted hover:bg-white/5 hover:text-sidebar-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    aria-hidden="true"
                    className={isActive ? 'text-accent' : ''}
                  />
                  <span className="hidden md:inline">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-center px-2 md:justify-between">
          {user && (
            <span className="hidden truncate text-sm text-sidebar-text-muted md:inline">
              {user.name}
            </span>
          )}
          <ThemeToggle className="text-sidebar-text-muted hover:bg-white/5 hover:text-sidebar-text" />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex w-full items-center justify-center gap-3 rounded px-3 py-2 text-sm font-medium text-sidebar-text-muted transition-colors hover:bg-white/5 hover:text-sidebar-text md:justify-start"
        >
          <LogOut size={20} aria-hidden="true" />
          <span className="hidden md:inline">Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}
