import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dashboardService from '../services/dashboardService';
import { extractErrorMessage } from '../services/api';
import { OS_STATUSES, formatCurrency } from '../utils/constants';
import { MOTO_IMAGES, cardImage, MODULE_CARD_IMAGES } from '../utils/theme';
import PageHero from '../components/PageHero';
import ImageCard from '../components/ImageCard';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.summary()
      .then(setSummary)
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  const cards = [
    { title: 'Ordens de Serviço', description: 'Kanban, orçamentos e ciclo de vida', to: '/ordens-servico', icon: '📋', imageKey: 'serviceOrders', show: true },
    { title: 'Clientes & Motos', description: 'CRM e histórico de manutenção', to: '/clientes', icon: '👥', imageKey: 'clients', show: true },
    { title: 'Estoque', description: 'Peças, margem e alertas', to: '/estoque', icon: '📦', imageKey: 'inventory', show: true },
    { title: 'Projetos Custom', description: 'Customizações e moodboard', to: '/projetos', icon: '🏍️', imageKey: 'projects', show: true },
    { title: 'Financeiro', description: 'Pagamentos e comissões', to: '/financeiro', icon: '💰', imageKey: 'finance', show: true },
    { title: 'Usuários', description: 'Gestão de acesso ao sistema', to: '/usuarios', icon: '👤', imageKey: 'users', show: isAdmin },
  ];

  const statCards = [
    { label: 'OS Abertas', value: summary?.totals.openOrders, color: 'text-workshop-accent', image: cardImage(0) },
    { label: 'Clientes', value: summary?.totals.clients, color: 'text-zinc-100', image: cardImage(1) },
    { label: 'Projetos Ativos', value: summary?.totals.activeProjects, color: 'text-blue-400', image: cardImage(2) },
    { label: 'OS não pagas', value: summary?.totals.unpaidOrders, color: 'text-red-400', image: cardImage(3) },
  ];

  return (
    <div className="space-y-6">
      <PageHero
        badge="Painel da Oficina"
        title="Dashboard"
        subtitle={`Controle geral — ${user?.name}`}
        image={MOTO_IMAGES.dashboard}
      />

      {error && <div className="rounded-lg border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div>}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, i) => (
              <ImageCard key={stat.label} image={stat.image} imageIndex={i}>
                <p className="text-xs uppercase text-zinc-500">{stat.label}</p>
                <p className={`mt-1 text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
              </ImageCard>
            ))}
          </div>

          {summary.lowStockParts?.length > 0 && (
            <ImageCard image={cardImage(4)} overlay="alert" className="border-red-500/30">
              <h2 className="mb-3 font-medium text-red-400">⚠ Estoque Baixo — Comprar Urgente</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {summary.lowStockParts.map((part) => (
                  <div key={part._id} className="rounded-lg border border-red-500/30 bg-workshop-800/50 p-3">
                    <p className="font-medium text-zinc-100">{part.name}</p>
                    <p className="text-red-400">{part.stock} un. (mín: {part.minStock})</p>
                  </div>
                ))}
              </div>
              <Link to="/estoque" className="mt-3 inline-block text-sm text-workshop-accent hover:underline">Ver estoque completo →</Link>
            </ImageCard>
          )}

          <ImageCard image={cardImage(12)}>
            <h2 className="mb-3 font-medium text-zinc-200">OS por Status</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.statusCounts || {}).map(([status, count]) => (
                <span key={status} className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white ${OS_STATUSES[status]?.color || 'bg-zinc-600'}`}>
                  {OS_STATUSES[status]?.label}: {count}
                </span>
              ))}
            </div>
          </ImageCard>

          {summary.recentOrders?.length > 0 && (
            <ImageCard image={cardImage(14)}>
              <h2 className="mb-3 font-medium text-zinc-200">OS Recentes</h2>
              <div className="space-y-2">
                {summary.recentOrders.map((o) => (
                  <div key={o._id} className="rounded-lg border border-workshop-700 bg-workshop-800/50 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300">{o.orderNumber} — {o.clientId?.name} ({o.vehicleId?.plate})</span>
                      <span className="text-emerald-400">{formatCurrency(o.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ImageCard>
          )}
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.filter((c) => c.show).map((card, i) => (
          <ImageCard key={card.to} to={card.to} image={MODULE_CARD_IMAGES[card.imageKey] || cardImage(i)}>
            <span className="text-2xl">{card.icon}</span>
            <h2 className="mt-3 text-lg font-semibold text-zinc-100 group-hover:text-workshop-accent">{card.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{card.description}</p>
          </ImageCard>
        ))}
      </div>
    </div>
  );
}
