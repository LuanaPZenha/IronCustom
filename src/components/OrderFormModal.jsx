import { useEffect, useState } from 'react';
import clientService from '../services/clientService';
import vehicleService from '../services/vehicleService';
import partService from '../services/partService';
import userService from '../services/userService';
import serviceOrderService from '../services/serviceOrderService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { extractErrorMessage } from '../services/api';
import { FUEL_LEVELS, formatCurrency } from '../utils/constants';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import Modal, { ModalActions } from './Modal';

const emptyChecklist = { fuelLevel: '', mileage: '', damages: [], notes: '' };

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function OrderFormModal({ isOpen, onClose, onSaved, order, defaultType = 'budget' }) {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('geral');

  const [form, setForm] = useState({
    documentType: defaultType,
    clientId: '',
    vehicleId: '',
    mechanicId: '',
    laborHours: 0,
    laborRate: 80,
    laborCommissionPercent: 40,
    lineItems: [],
    checklist: emptyChecklist,
    photos: [],
    notes: '',
    payment: { method: '', paid: false, installments: 1 },
  });

  const [newDamage, setNewDamage] = useState({ location: '', description: '', severity: 'light' });
  const [newItem, setNewItem] = useState({ partId: '', description: '', quantity: 1, unitPrice: 0, type: 'part' });

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      try {
        const [c, p] = await Promise.all([clientService.list(), partService.list()]);
        setClients(c);
        setParts(p);
        if (isAdmin) {
          const u = await userService.list();
          setMechanics(u);
        }
      } catch (err) {
        toast.error(extractErrorMessage(err));
      }
    }
    load();
  }, [isOpen, isAdmin, toast]);

  useEffect(() => {
    if (!isOpen) return;
    if (order) {
      setForm({
        documentType: order.documentType,
        clientId: order.clientId?._id || order.clientId || '',
        vehicleId: order.vehicleId?._id || order.vehicleId || '',
        mechanicId: order.mechanicId || user?.id || '',
        laborHours: order.laborHours || 0,
        laborRate: order.laborRate || 80,
        laborCommissionPercent: order.laborCommissionPercent || 40,
        lineItems: order.lineItems || [],
        checklist: order.checklist || emptyChecklist,
        photos: order.photos || [],
        notes: order.notes || '',
        payment: order.payment || { method: '', paid: false, installments: 1 },
      });
    } else {
      setForm({
        documentType: defaultType,
        clientId: '',
        vehicleId: '',
        mechanicId: user?.id || '',
        laborHours: 0,
        laborRate: 80,
        laborCommissionPercent: 40,
        lineItems: [],
        checklist: emptyChecklist,
        photos: [],
        notes: '',
        payment: { method: '', paid: false, installments: 1 },
      });
    }
    setTab('geral');
  }, [isOpen, order, defaultType, user]);

  useEffect(() => {
    if (!form.clientId) {
      setVehicles([]);
      return;
    }
    vehicleService.list({ clientId: form.clientId }).then(setVehicles).catch(() => setVehicles([]));
  }, [form.clientId]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function addLineItem() {
    if (!newItem.description) return;
    const part = parts.find((p) => p._id === newItem.partId);
    const item = {
      ...newItem,
      quantity: Number(newItem.quantity),
      unitPrice: Number(newItem.unitPrice) || (part?.salePrice ?? 0),
      description: newItem.description || part?.name || '',
    };
    setForm((prev) => ({ ...prev, lineItems: [...prev.lineItems, item] }));
    setNewItem({ partId: '', description: '', quantity: 1, unitPrice: 0, type: 'part' });
  }

  function removeLineItem(idx) {
    setForm((prev) => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) }));
  }

  function addDamage() {
    if (!newDamage.description) return;
    setForm((prev) => ({
      ...prev,
      checklist: { ...prev.checklist, damages: [...(prev.checklist.damages || []), newDamage] },
    }));
    setNewDamage({ location: '', description: '', severity: 'light' });
  }

  async function handlePhotos(e) {
    const files = Array.from(e.target.files || []);
    const encoded = await Promise.all(
      files.map(async (file) => ({
        data: await readFileAsBase64(file),
        caption: file.name,
      }))
    );
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...encoded] }));
  }

  const total =
    form.lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0) +
    form.laborHours * form.laborRate;

  async function handleSave() {
    if (!form.clientId || !form.vehicleId) {
      toast.error('Selecione cliente e veículo');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        mechanicId: Number(form.mechanicId) || user?.id,
        laborHours: Number(form.laborHours),
        laborRate: Number(form.laborRate),
        laborCommissionPercent: Number(form.laborCommissionPercent),
        checklist: {
          ...form.checklist,
          mileage: form.checklist.mileage ? Number(form.checklist.mileage) : undefined,
        },
      };
      if (order?._id) {
        await serviceOrderService.update(order._id, payload);
        toast.success('Ordem atualizada!');
      } else {
        await serviceOrderService.create(payload);
        toast.success(form.documentType === 'budget' ? 'Orçamento criado!' : 'OS criada!');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'itens', label: 'Itens' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'fotos', label: 'Fotos' },
    { id: 'pagamento', label: 'Pagamento' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? 'Editar Documento' : form.documentType === 'budget' ? 'Novo Orçamento' : 'Nova OS'}
      footer={<ModalActions onCancel={onClose} onConfirm={handleSave} loading={saving} />}
    >
      <div className="mb-4 flex flex-wrap gap-2 border-b border-workshop-700 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id ? 'bg-workshop-accent text-white' : 'bg-workshop-800 text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'geral' && (
        <div className="space-y-4">
          <Select label="Tipo" value={form.documentType} onChange={(e) => setField('documentType', e.target.value)}>
            <option value="budget">Orçamento</option>
            <option value="service_order">Ordem de Serviço</option>
          </Select>
          <Select label="Cliente" value={form.clientId} onChange={(e) => setField('clientId', e.target.value)} required>
            <option value="">Selecione...</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
          <Select label="Veículo" value={form.vehicleId} onChange={(e) => setField('vehicleId', e.target.value)} required>
            <option value="">Selecione...</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>{v.plate} — {v.brand} {v.model}</option>
            ))}
          </Select>
          {isAdmin && (
            <Select label="Mecânico" value={form.mechanicId} onChange={(e) => setField('mechanicId', e.target.value)}>
              <option value="">Selecione...</option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Horas M.O." type="number" min="0" step="0.5" value={form.laborHours} onChange={(e) => setField('laborHours', e.target.value)} />
            <Input label="R$/hora" type="number" min="0" value={form.laborRate} onChange={(e) => setField('laborRate', e.target.value)} />
            <Input label="Comissão %" type="number" min="0" max="100" value={form.laborCommissionPercent} onChange={(e) => setField('laborCommissionPercent', e.target.value)} />
          </div>
          <Textarea label="Observações" value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
          <p className="text-right text-sm font-semibold text-workshop-accent">Total: {formatCurrency(total)}</p>
        </div>
      )}

      {tab === 'itens' && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Peça (estoque)" value={newItem.partId} onChange={(e) => {
              const part = parts.find((p) => p._id === e.target.value);
              setNewItem((prev) => ({
                ...prev,
                partId: e.target.value,
                description: part?.name || prev.description,
                unitPrice: part?.salePrice || prev.unitPrice,
              }));
            }}>
              <option value="">Manual / Serviço</option>
              {parts.map((p) => (
                <option key={p._id} value={p._id}>{p.name} (est: {p.stock})</option>
              ))}
            </Select>
            <Input label="Descrição" value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} />
            <Input label="Qtd" type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))} />
            <Input label="Preço unit." type="number" min="0" step="0.01" value={newItem.unitPrice} onChange={(e) => setNewItem((p) => ({ ...p, unitPrice: e.target.value }))} />
          </div>
          <Button variant="secondary" onClick={addLineItem}>+ Adicionar item</Button>
          <ul className="space-y-2">
            {form.lineItems.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between rounded-lg bg-workshop-800 px-3 py-2 text-sm">
                <span>{item.description} — {item.quantity}x {formatCurrency(item.unitPrice)}</span>
                <button type="button" className="text-red-400" onClick={() => removeLineItem(idx)}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'checklist' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Combustível" value={form.checklist.fuelLevel} onChange={(e) => setForm((p) => ({ ...p, checklist: { ...p.checklist, fuelLevel: e.target.value } }))}>
              {Object.entries(FUEL_LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Input label="Quilometragem" type="number" min="0" value={form.checklist.mileage} onChange={(e) => setForm((p) => ({ ...p, checklist: { ...p.checklist, mileage: e.target.value } }))} />
          </div>
          <Textarea label="Notas da inspeção" value={form.checklist.notes} onChange={(e) => setForm((p) => ({ ...p, checklist: { ...p.checklist, notes: e.target.value } }))} />
          <div className="rounded-lg border border-workshop-700 p-3">
            <p className="mb-2 text-sm font-medium text-zinc-300">Avarias pré-existentes</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input placeholder="Local (ex: tanque)" value={newDamage.location} onChange={(e) => setNewDamage((p) => ({ ...p, location: e.target.value }))} />
              <Input placeholder="Descrição" value={newDamage.description} onChange={(e) => setNewDamage((p) => ({ ...p, description: e.target.value }))} />
              <Select value={newDamage.severity} onChange={(e) => setNewDamage((p) => ({ ...p, severity: e.target.value }))}>
                <option value="light">Leve</option>
                <option value="moderate">Moderado</option>
                <option value="severe">Grave</option>
              </Select>
            </div>
            <Button variant="secondary" className="mt-2 !text-xs" onClick={addDamage}>+ Registrar avaria</Button>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              {(form.checklist.damages || []).map((d, i) => (
                <li key={i}>• {d.location}: {d.description} ({d.severity})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'fotos' && (
        <div className="space-y-4">
          <input type="file" accept="image/*" multiple onChange={handlePhotos} className="text-sm text-zinc-400" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {form.photos.map((photo, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg border border-workshop-700">
                <img src={photo.data} alt={photo.caption} className="h-24 w-full object-cover" />
                <p className="truncate px-2 py-1 text-xs text-zinc-500">{photo.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pagamento' && (
        <div className="space-y-4">
          <Select label="Forma de pagamento" value={form.payment.method} onChange={(e) => setForm((p) => ({ ...p, payment: { ...p.payment, method: e.target.value } }))}>
            <option value="">Não informado</option>
            <option value="pix">Pix</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
            <option value="cash">Dinheiro</option>
          </Select>
          <Input label="Parcelas" type="number" min="1" value={form.payment.installments} onChange={(e) => setForm((p) => ({ ...p, payment: { ...p.payment, installments: e.target.value } }))} />
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form.payment.paid} onChange={(e) => setForm((p) => ({ ...p, payment: { ...p.payment, paid: e.target.checked } }))} />
            Pagamento recebido
          </label>
        </div>
      )}
    </Modal>
  );
}
