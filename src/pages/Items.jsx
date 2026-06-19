import { useCallback, useEffect, useState } from 'react';
import itemService from '../services/itemService';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { MOTO_IMAGES } from '../utils/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import PageHero from '../components/PageHero';
import Modal, { ModalActions } from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { brand: '', model: '', year: '', engineCapacity: '' };

export default function Items() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await itemService.list();
      setItems(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreate() {
    setSelectedItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item) {
    setSelectedItem(item);
    setForm({
      brand: item.brand,
      model: item.model,
      year: String(item.year),
      engineCapacity: String(item.engineCapacity),
    });
    setModalOpen(true);
  }

  function openDelete(item) {
    setSelectedItem(item);
    setConfirmOpen(true);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setSaving(true);
    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      engineCapacity: Number(form.engineCapacity),
    };

    try {
      if (selectedItem) {
        await itemService.update(selectedItem._id, payload);
        toast.success('Item atualizado com sucesso!');
      } else {
        await itemService.create(payload);
        toast.success('Item cadastrado com sucesso!');
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await itemService.remove(selectedItem._id);
      toast.success('Item excluído com sucesso!');
      setConfirmOpen(false);
      loadItems();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        badge="Catálogo"
        title="Itens da Oficina"
        subtitle="Motos custom, peças e serviços cadastrados"
        image={MOTO_IMAGES.inventory}
      />
      <div className="flex justify-end">
        <Button onClick={openCreate}>+ Novo Item</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-workshop-700 border-t-workshop-accent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-zinc-100">
                    {item.brand} {item.model}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {item.year} · {item.engineCapacity} cc
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1 !py-2 !text-xs" onClick={() => openEdit(item)}>
                  Editar
                </Button>
                <Button variant="danger" className="flex-1 !py-2 !text-xs" onClick={() => openDelete(item)}>
                  Excluir
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="col-span-full py-8 text-center text-zinc-500">Nenhum item cadastrado</p>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem ? 'Editar Item' : 'Novo Item'}
        footer={
          <ModalActions
            onCancel={() => setModalOpen(false)}
            onConfirm={handleSubmit}
            loading={saving}
            confirmLabel={selectedItem ? 'Atualizar' : 'Cadastrar'}
          />
        }
      >
        <div className="space-y-4">
          <Input label="Marca" name="brand" value={form.brand} onChange={handleChange} required placeholder="Harley-Davidson" />
          <Input label="Modelo" name="model" value={form.model} onChange={handleChange} required placeholder="Sportster" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Ano" name="year" type="number" value={form.year} onChange={handleChange} required min="1885" />
            <Input
              label="Cilindrada (cc)"
              name="engineCapacity"
              type="number"
              value={form.engineCapacity}
              onChange={handleChange}
              required
              min="50"
              max="2500"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir item"
        message={`Tem certeza que deseja excluir "${selectedItem?.brand} ${selectedItem?.model}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />
    </div>
  );
}
