import { useCallback, useEffect, useState } from 'react';
import serviceOrderService from '../services/serviceOrderService';
import userService from '../services/userService';
import { extractErrorMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '../utils/constants';
import { MOTO_IMAGES } from '../utils/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import PageHero from '../components/PageHero';
export default function Finance() {
  const { isAdmin, user } = useAuth();
  const toast = useToast();
  const [commissions, setCommissions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    mechanicId: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.mechanicId) params.mechanicId = filters.mechanicId;
      else if (!isAdmin) params.mechanicId = user?.id;

      const [comm, osList] = await Promise.all([
        serviceOrderService.commissions(params),
        serviceOrderService.list({ documentType: 'service_order' }),
      ]);
      setCommissions(comm);
      setOrders(osList.filter((o) => ['completed', 'delivered'].includes(o.status)));

      if (isAdmin) {
        const users = await userService.list();
        setMechanics(users);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin, user?.id, toast]);

  useEffect(() => { load(); }, [load]);

  async function updatePayment(orderId, payment) {
    try {
      await serviceOrderService.updatePayment(orderId, payment);
      toast.success('Pagamento atualizado!');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  const totalCommissions = commissions.reduce((s, c) => s + c.totalCommission, 0);
  const totalRevenue = commissions.reduce((s, c) => s + c.totalRevenue, 0);
  const unpaidCount = orders.filter((o) => !o.payment?.paid).length;

  return (
    <div className="space-y-6">
      <PageHero
        badge="Gestão Financeira"
        title="Financeiro"
        subtitle="Pagamentos, comissionamento de mecânicos e receita"
        image={MOTO_IMAGES.finance}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs uppercase text-zinc-500">Receita (período)</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase text-zinc-500">Comissões M.O.</p>
          <p className="mt-1 text-2xl font-semibold text-workshop-accent">{formatCurrency(totalCommissions)}</p>
        </div>
        <div className={`card ${unpaidCount > 0 ? 'border-red-500/50' : ''}`}>
          <p className="text-xs uppercase text-zinc-500">OS não pagas</p>
          <p className="mt-1 text-2xl font-semibold text-red-400">{unpaidCount}</p>
        </div>
      </div>

      <div className="card flex flex-wrap gap-4">        <Input label="Data início" type="date" value={filters.startDate} onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))} />
        <Input label="Data fim" type="date" value={filters.endDate} onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))} />
        {isAdmin && (
          <Select label="Mecânico" value={filters.mechanicId} onChange={(e) => setFilters((p) => ({ ...p, mechanicId: e.target.value }))}>
            <option value="">Todos</option>
            {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
        )}
        <div className="flex items-end">
          <Button onClick={load}>Filtrar</Button>
        </div>
      </div>

      {loading ? (        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-workshop-700 border-t-workshop-accent" />
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="mb-4 font-medium text-zinc-200">Comissões por Mecânico</h2>            {commissions.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhuma comissão no período.</p>
            ) : (
              <div className="space-y-4">
                {commissions.map((c) => (
                  <div key={c.mechanicId} className="rounded-lg border border-workshop-700 bg-workshop-800/50 p-4">
                    <div className="flex justify-between">
                      <p className="font-medium text-zinc-100">Mecânico #{c.mechanicId || 'N/A'}</p>
                      <p className="text-workshop-accent">{formatCurrency(c.totalCommission)}</p>
                    </div>
                    <p className="text-xs text-zinc-500">{c.orders.length} OS | M.O. total: {formatCurrency(c.totalLabor)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 font-medium text-zinc-200">Controle de Pagamentos</h2>            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="rounded-lg border border-workshop-700 bg-workshop-800/50 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{order.orderNumber} — {order.clientId?.name}</p>
                      <p className="text-xs text-zinc-400">{formatDate(order.updatedAt)} | {formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={order.payment?.method || ''}
                        onChange={(e) => updatePayment(order._id, { ...order.payment, method: e.target.value })}
                        className="!mb-0"
                      >
                        {Object.entries(PAYMENT_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </Select>
                      <label className="flex items-center gap-1 text-xs text-zinc-300">
                        <input
                          type="checkbox"
                          checked={order.payment?.paid || false}
                          onChange={(e) => updatePayment(order._id, { ...order.payment, paid: e.target.checked, paidAt: e.target.checked ? new Date().toISOString() : null })}
                        />
                        Pago
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}    </div>
  );
}
