import { useCallback, useEffect, useState } from 'react';
import serviceOrderService from '../services/serviceOrderService';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { OS_STATUSES, OS_STATUS_ORDER, formatCurrency } from '../utils/constants';
import { MOTO_IMAGES } from '../utils/theme';
import { generateOrderPdf } from '../utils/pdf';
import { buildWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';
import Button from '../components/Button';
import Select from '../components/Select';
import PageHero from '../components/PageHero';
import OrderFormModal from '../components/OrderFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ServiceOrders() {
  const toast = useToast();
  const [kanban, setKanban] = useState({ columns: {}, budgets: [] });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [defaultType, setDefaultType] = useState('service_order');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await serviceOrderService.kanban();
      setKanban(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  function openCreate(type) {
    setEditOrder(null);
    setDefaultType(type);
    setModalOpen(true);
  }

  async function handleStatusChange(orderId, status) {
    try {
      await serviceOrderService.updateStatus(orderId, status);
      toast.success('Status atualizado!');
      load();
      if (selectedOrder?._id === orderId) {
        const updated = await serviceOrderService.getById(orderId);
        setSelectedOrder(updated);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleConvert(budgetId) {
    try {
      await serviceOrderService.convertBudget(budgetId);
      toast.success('Orçamento convertido em OS!');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await serviceOrderService.remove(confirmDelete._id);
      toast.success('Documento excluído!');
      setConfirmDelete(null);
      setSelectedOrder(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  function OrderCard({ order, showConvert }) {
    return (
      <div
        className="card cursor-pointer !p-3 transition hover:border-workshop-accent/50"
        onClick={() => setSelectedOrder(order)}
        onKeyDown={(e) => e.key === 'Enter' && setSelectedOrder(order)}
        role="button"
        tabIndex={0}
      >        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-workshop-accent">{order.orderNumber}</p>
          {order.documentType === 'budget' && (
            <span className="rounded bg-yellow-900/50 px-1.5 py-0.5 text-[10px] text-yellow-300">ORÇAMENTO</span>
          )}
        </div>
        <p className="mt-1 text-sm font-medium text-zinc-100">{order.clientId?.name}</p>
        <p className="text-xs text-zinc-400">{order.vehicleId?.plate} — {order.vehicleId?.brand}</p>
        <p className="mt-2 text-sm font-semibold text-emerald-400">{formatCurrency(order.totalAmount)}</p>
        {showConvert && (
          <Button
            variant="secondary"
            className="mt-2 w-full !py-1 !text-xs"
            onClick={(e) => { e.stopPropagation(); handleConvert(order._id); }}
          >
            Aprovar → OS
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHero
        badge="Coração da Oficina"
        title="Ordens de Serviço"
        subtitle="Kanban, orçamentos e ciclo de vida da OS"
        image={MOTO_IMAGES.serviceOrders}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openCreate('budget')}>+ Orçamento</Button>
          <Button onClick={() => openCreate('service_order')}>+ Nova OS</Button>
        </div>
      </div>

      {kanban.budgets?.length > 0 && (
        <div className="card">
          <h2 className="mb-3 font-medium text-yellow-400">Orçamentos Pendentes</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kanban.budgets.map((b) => (
              <OrderCard key={b._id} order={b} showConvert={b.status === 'awaiting_approval' || b.documentType === 'budget'} />
            ))}
          </div>
        </div>      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-workshop-700 border-t-workshop-accent" />
        </div>
      ) : (
        <div className="min-w-0 overflow-x-auto pb-4">
          <div className="flex min-w-max gap-4">
            {OS_STATUS_ORDER.map((status) => (
              <div key={status} className="card w-64 shrink-0 !p-3">
                <div className={`mb-3 rounded-lg px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white ${OS_STATUSES[status].color}`}>
                  {OS_STATUSES[status].label}
                  <span className="ml-1 opacity-70">({kanban.columns[status]?.length || 0})</span>
                </div>
                <div className="space-y-2">
                  {(kanban.columns[status] || []).map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
              </div>
            ))}          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedOrder(null)} />
          <div className="card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-glow">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl text-workshop-accent">{selectedOrder.orderNumber}</p>
                <p className="text-sm text-zinc-400">{selectedOrder.clientId?.name} — {selectedOrder.vehicleId?.plate}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-3">
              <Select
                label="Alterar status"
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
              >
                {OS_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{OS_STATUSES[s].label}</option>
                ))}
              </Select>

              <div className="rounded-lg bg-workshop-800 p-3 text-sm">
                <p className="font-semibold text-zinc-200">Total: {formatCurrency(selectedOrder.totalAmount)}</p>
                {(selectedOrder.lineItems || []).map((item, i) => (
                  <p key={i} className="text-zinc-400">• {item.description} ({item.quantity}x)</p>
                ))}
              </div>

              {selectedOrder.checklist?.damages?.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium text-zinc-300">Avarias registradas:</p>
                  {selectedOrder.checklist.damages.map((d, i) => (
                    <p key={i} className="text-zinc-400">• {d.location}: {d.description}</p>
                  ))}
                </div>
              )}

              {selectedOrder.photos?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedOrder.photos.map((p, i) => (
                    <img key={i} src={p.data} alt={p.caption} className="h-16 rounded object-cover" />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="secondary" className="!text-xs" onClick={() => { setEditOrder(selectedOrder); setModalOpen(true); }}>
                  Editar
                </Button>
                <Button variant="secondary" className="!text-xs" onClick={() => generateOrderPdf(selectedOrder)}>
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  className="!text-xs"
                  onClick={() => openWhatsApp(
                    selectedOrder.clientId?.whatsapp || selectedOrder.clientId?.phone,
                    buildWhatsAppMessage(selectedOrder)
                  )}
                >
                  WhatsApp
                </Button>
                {selectedOrder.documentType === 'budget' && (
                  <Button className="!text-xs" onClick={() => handleConvert(selectedOrder._id)}>Converter em OS</Button>
                )}
                <Button variant="danger" className="!text-xs" onClick={() => setConfirmDelete(selectedOrder)}>Excluir</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <OrderFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditOrder(null); }}
        onSaved={load}
        order={editOrder}
        defaultType={defaultType}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Excluir documento"
        message={`Excluir ${confirmDelete?.orderNumber}?`}
      />
    </div>
  );
}
