import { ClipboardCheck, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/auditorias', label: 'Auditorías', icon: ClipboardCheck },
];

export function Sidebar() {
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
    </nav>
  );
}
