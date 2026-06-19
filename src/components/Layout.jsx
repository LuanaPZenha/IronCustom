import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Sidebar from './Sidebar';
import WorkshopBackground from './WorkshopBackground';

function Header({ onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-workshop-700/60 bg-workshop-950/75 px-4 py-3 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-workshop-800 hover:text-white lg:hidden"
          aria-label="Abrir menu"
        >
          ☰
        </button>
        <div>
          <p className="text-sm text-zinc-400">Bem-vindo,</p>
          <p className="font-medium text-zinc-100">{user?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-workshop-accent/30 bg-workshop-accent/10 px-3 py-1 text-xs uppercase tracking-wide text-workshop-accent sm:inline">
          {user?.role}
        </span>
        <Button variant="secondary" onClick={logout} className="!py-2 !text-xs">
          Sair
        </Button>
      </div>
    </header>
  );
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen">
      <WorkshopBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
