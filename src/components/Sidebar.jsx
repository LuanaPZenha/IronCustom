import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MOTO_IMAGES } from '../utils/theme';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { to: '/ordens-servico', label: 'Ordens de Serviço', icon: '📋' },
  { to: '/clientes', label: 'Clientes & Motos', icon: '👥' },
  { to: '/estoque', label: 'Estoque', icon: '📦' },
  { to: '/projetos', label: 'Projetos Custom', icon: '🏍️' },
  { to: '/financeiro', label: 'Financeiro', icon: '💰' },
  { to: '/usuarios', label: 'Usuários', icon: '👤', adminOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth();
  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-workshop-700/60 bg-workshop-900/85 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-workshop-700/60 px-5 py-6">
          <p className="font-display text-3xl tracking-wider text-workshop-accent">IRON CUSTOM</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">Oficina de Motos</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {filteredItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-workshop-accent/15 text-workshop-accent shadow-glow'
                    : 'text-zinc-400 hover:bg-workshop-800/80 hover:text-zinc-100'
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="relative m-4 overflow-hidden rounded-xl border border-workshop-700/60">
          <img
            src={MOTO_IMAGES.sidebar}
            alt=""
            className="h-24 w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-workshop-950 via-transparent to-transparent" />
          <p className="absolute bottom-2 left-3 text-[10px] uppercase tracking-widest text-workshop-accent">
            Custom Life
          </p>
        </div>
      </aside>
    </>
  );
}
