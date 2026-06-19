import { useCallback, useEffect, useState } from 'react';
import partService from '../services/partService';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/constants';
import { MOTO_IMAGES } from '../utils/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import PageHero from '../components/PageHero';
import Modal, { ModalActions } from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { name: '', sku: '', category: 'Geral', description: '', costPrice: '', salePrice: '', stock: 0, minStock: 5 };

export default function Inventory() {
  const toast = useToast();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setParts(await partService.list());
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  function openForm(part = null) {
    setSelected(part);
    setForm(part ? { ...part, costPrice: part.costPrice, salePrice: part.salePrice } : emptyForm);
    setModalOpen(true);
  }

  function calcMargin(cost, sale) {
    if (!sale || sale === 0) return 0;
    return Math.round(((sale - cost) / sale) * 100);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        costPrice: Number(form.costPrice),
        salePrice: Number(form.salePrice),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
      };
      if (selected) {
        await partService.update(selected._id, payload);
        toast.success('Peça atualizada!');
      } else {
        await partService.create(payload);
        toast.success('Peça cadastrada!');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await partService.remove(confirmDelete._id);
      toast.success('Peça excluída!');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        badge="Controle de Estoque"
        title="Estoque de Peças"
        subtitle="Margem de lucro, alertas e baixa automática"
        image={MOTO_IMAGES.inventory}
      />
      <div className="flex justify-end">
        <Button onClick={() => openForm()}>+ Nova Peça</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-workshop-700 border-t-workshop-accent" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {parts.map((part) => {
              const low = part.stock <= part.minStock;
              const margin = calcMargin(part.costPrice, part.salePrice);
              return (
                <div
                  key={part._id}
                  className={`card ${low ? 'border-red-500/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-100">{part.name}</p>
                      <p className="text-xs text-zinc-500">{part.category} {part.sku && `· ${part.sku}`}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">{margin}%</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500">Estoque</p>
                      <p className={low ? 'font-semibold text-red-400' : 'text-zinc-200'}>{part.stock} <span className="text-xs text-zinc-500">/ mín {part.minStock}</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Venda</p>
                      <p className="text-zinc-200">{formatCurrency(part.salePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Custo</p>
                      <p className="text-zinc-400">{formatCurrency(part.costPrice)}</p>
                    </div>
                  </div>
                  {low && <p className="mt-2 text-xs text-red-400">⚠ Estoque baixo</p>}
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" className="flex-1 !py-2 !text-xs" onClick={() => openForm(part)}>Editar</Button>
                    <Button variant="danger" className="flex-1 !py-2 !text-xs" onClick={() => setConfirmDelete(part)}>Excluir</Button>
                  </div>
                </div>
              );
            })}
          </div>
          {parts.length === 0 && <p className="py-8 text-center text-zinc-500">Nenhuma peça cadastrada</p>}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Editar Peça' : 'Nova Peça'}
        footer={<ModalActions onCancel={() => setModalOpen(false)} onConfirm={handleSave} loading={saving} />}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="SKU" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
            <Input label="Categoria" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
            <Input label="Preço de Custo" type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => setForm((p) => ({ ...p, costPrice: e.target.value }))} required />
            <Input label="Preço de Venda" type="number" min="0" step="0.01" value={form.salePrice} onChange={(e) => setForm((p) => ({ ...p, salePrice: e.target.value }))} required />
            <Input label="Estoque" type="number" min="0" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
            <Input label="Estoque Mínimo" type="number" min="0" value={form.minStock} onChange={(e) => setForm((p) => ({ ...p, minStock: e.target.value }))} />
          </div>
          {form.costPrice && form.salePrice && (
            <p className="text-sm text-emerald-400">Margem: {calcMargin(Number(form.costPrice), Number(form.salePrice))}%</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog isOpen={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete}
        title="Excluir peça" message={`Excluir "${confirmDelete?.name}"?`} />
    </div>
  );
}
