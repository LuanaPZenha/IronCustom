import { useCallback, useEffect, useState } from 'react';
import clientService from '../services/clientService';
import vehicleService from '../services/vehicleService';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { formatDate, formatCurrency } from '../utils/constants';
import { MOTO_IMAGES } from '../utils/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import PageHero from '../components/PageHero';
import Modal, { ModalActions } from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyClient = { name: '', email: '', phone: '', whatsapp: '', notes: '' };
const emptyVehicle = { plate: '', chassis: '', brand: '', model: '', year: '', color: '' };

export default function Clients() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientModal, setClientModal] = useState(false);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [clientForm, setClientForm] = useState(emptyClient);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [history, setHistory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [plateSearch, setPlateSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, v] = await Promise.all([clientService.list(), vehicleService.list()]);
      setClients(c);
      setVehicles(v);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  function openClientForm(client = null) {
    setEditClient(client);
    setClientForm(client ? { ...client } : emptyClient);
    setClientModal(true);
  }

  function openVehicleForm(client) {
    setSelectedClient(client);
    setVehicleForm(emptyVehicle);
    setVehicleModal(true);
  }

  async function saveClient() {
    setSaving(true);
    try {
      if (editClient) {
        await clientService.update(editClient._id, clientForm);
        toast.success('Cliente atualizado!');
      } else {
        await clientService.create(clientForm);
        toast.success('Cliente cadastrado!');
      }
      setClientModal(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveVehicle() {
    setSaving(true);
    try {
      await vehicleService.create({ ...vehicleForm, clientId: selectedClient._id, year: Number(vehicleForm.year) });
      toast.success('Moto cadastrada!');
      setVehicleModal(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function searchHistory(plate) {
    const p = (plate || plateSearch).trim();
    if (!p) return;
    try {
      const data = await vehicleService.getHistory(p);
      setHistory(data);
      setHistoryModal(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      if (confirmDelete.type === 'client') {
        await clientService.remove(confirmDelete.id);
      } else {
        await vehicleService.remove(confirmDelete.id);
      }
      toast.success('Registro excluído!');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  const clientVehicles = (clientId) => vehicles.filter((v) => v.clientId?._id === clientId || v.clientId === clientId);

  return (
    <div className="space-y-6">
      <PageHero
        badge="CRM"
        title="Clientes & Motos"
        subtitle="Vínculo cliente-moto e histórico de manutenção"
        image={MOTO_IMAGES.clients}
      />
      <div className="flex justify-end">
        <Button onClick={() => openClientForm()}>+ Novo Cliente</Button>
      </div>

      <div className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Buscar histórico por placa"
          value={plateSearch}
          onChange={(e) => setPlateSearch(e.target.value.toUpperCase())}
          placeholder="ABC1D23"
          className="flex-1"
        />
        <Button onClick={searchHistory}>Ver Histórico</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-workshop-700 border-t-workshop-accent" />
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client._id} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">{client.name}</h2>
                  <p className="text-sm text-zinc-400">{client.phone} {client.whatsapp && `| WhatsApp: ${client.whatsapp}`}</p>
                  {client.email && <p className="text-sm text-zinc-500">{client.email}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => openClientForm(client)}>Editar</Button>
                  <Button className="!py-1.5 !text-xs" onClick={() => openVehicleForm(client)}>+ Moto</Button>
                  <Button variant="danger" className="!py-1.5 !text-xs" onClick={() => setConfirmDelete({ type: 'client', id: client._id, name: client.name })}>Excluir</Button>
                </div>
              </div>

              {clientVehicles(client._id).length > 0 && (
                <div className="mt-4 border-t border-workshop-700 pt-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Motos cadastradas</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {clientVehicles(client._id).map((v) => (
                      <div key={v._id} className="rounded-lg border border-workshop-700 bg-workshop-800/50 p-3">
                        <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-workshop-accent">{v.plate}</p>
                          <p className="text-zinc-400">{v.brand} {v.model} ({v.year}) — {v.color}</p>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" className="text-xs text-zinc-400 hover:text-white" onClick={() => searchHistory(v.plate)}>Histórico</button>
                          <button type="button" className="text-xs text-red-400" onClick={() => setConfirmDelete({ type: 'vehicle', id: v._id, name: v.plate })}>✕</button>
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {clients.length === 0 && <p className="py-8 text-center text-zinc-500">Nenhum cliente cadastrado</p>}
        </div>
      )}

      <Modal isOpen={clientModal} onClose={() => setClientModal(false)} title={editClient ? 'Editar Cliente' : 'Novo Cliente'}
        footer={<ModalActions onCancel={() => setClientModal(false)} onConfirm={saveClient} loading={saving} />}>
        <div className="space-y-4">
          <Input label="Nome" value={clientForm.name} onChange={(e) => setClientForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Telefone" value={clientForm.phone} onChange={(e) => setClientForm((p) => ({ ...p, phone: e.target.value }))} required />
          <Input label="WhatsApp" value={clientForm.whatsapp} onChange={(e) => setClientForm((p) => ({ ...p, whatsapp: e.target.value }))} />
          <Input label="E-mail" type="email" value={clientForm.email} onChange={(e) => setClientForm((p) => ({ ...p, email: e.target.value }))} />
          <Textarea label="Observações" value={clientForm.notes} onChange={(e) => setClientForm((p) => ({ ...p, notes: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={vehicleModal} onClose={() => setVehicleModal(false)} title={`Nova Moto — ${selectedClient?.name}`}
        footer={<ModalActions onCancel={() => setVehicleModal(false)} onConfirm={saveVehicle} loading={saving} confirmLabel="Cadastrar" />}>
        <div className="space-y-4">
          <Input label="Placa" value={vehicleForm.plate} onChange={(e) => setVehicleForm((p) => ({ ...p, plate: e.target.value.toUpperCase() }))} required />
          <Input label="Chassi" value={vehicleForm.chassis} onChange={(e) => setVehicleForm((p) => ({ ...p, chassis: e.target.value }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Marca" value={vehicleForm.brand} onChange={(e) => setVehicleForm((p) => ({ ...p, brand: e.target.value }))} required />
            <Input label="Modelo" value={vehicleForm.model} onChange={(e) => setVehicleForm((p) => ({ ...p, model: e.target.value }))} required />
            <Input label="Ano" type="number" value={vehicleForm.year} onChange={(e) => setVehicleForm((p) => ({ ...p, year: e.target.value }))} required />
            <Input label="Cor" value={vehicleForm.color} onChange={(e) => setVehicleForm((p) => ({ ...p, color: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={historyModal} onClose={() => setHistoryModal(false)} title={`Histórico — ${history?.vehicle?.plate}`}>
        {history && (
          <div className="space-y-4">
            <div className="rounded-lg bg-workshop-800 p-3 text-sm">
              <p className="font-medium text-zinc-200">{history.vehicle.brand} {history.vehicle.model} ({history.vehicle.year})</p>
              <p className="text-zinc-400">Cliente: {history.vehicle.clientId?.name}</p>
            </div>
            {history.history.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhuma manutenção registrada ainda.</p>
            ) : (
              <ul className="space-y-2">
                {history.history.map((h) => (
                  <li key={h._id} className="rounded-lg border border-workshop-700 bg-workshop-800/50 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-workshop-accent">{h.orderNumber}</span>
                      <span className="text-zinc-500">{formatDate(h.updatedAt)}</span>
                    </div>
                    <p className="text-zinc-400">{formatCurrency(h.totalAmount)}</p>
                    {(h.lineItems || []).slice(0, 3).map((item, li) => (
                      <p key={li} className="text-xs text-zinc-500">• {item.description}</p>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete}
        title="Excluir registro" message={`Excluir ${confirmDelete?.name}?`} />
    </div>
  );
}
