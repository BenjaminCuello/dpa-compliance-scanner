import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Panel' },
  { to: '/auditorias', label: 'Auditorías' },
];

export function Sidebar() {
  return (
    <nav className="w-48 shrink-0 border-r border-slate-200 bg-white p-4">
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
