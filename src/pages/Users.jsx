import { useCallback, useEffect, useState } from 'react';
import userService from '../services/userService';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { MOTO_IMAGES } from '../utils/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import PageHero from '../components/PageHero';
import Modal, { ModalActions } from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = { name: '', email: '', password: '', role: 'user' };

export default function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.list();
      setUsers(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openCreate() {
    setSelectedUser(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(user) {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setFormErrors({});
    setModalOpen(true);
  }

  function openDelete(user) {
    setSelectedUser(user);
    setConfirmOpen(true);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setSaving(true);
    setFormErrors({});

    const payload = { name: form.name, email: form.email, role: form.role };
    if (form.password) payload.password = form.password;

    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, payload);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        if (!form.password) {
          setFormErrors({ password: 'Senha é obrigatória para novo usuário' });
          setSaving(false);
          return;
        }
        await userService.create(payload);
        toast.success('Usuário cadastrado com sucesso!');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await userService.remove(selectedUser.id);
      toast.success('Usuário excluído com sucesso!');
      setConfirmOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        badge="Administração"
        title="Usuários"
        subtitle="Gerencie os usuários com acesso ao sistema"
        image={MOTO_IMAGES.users}
      />
      <div className="flex justify-end">
        <Button onClick={openCreate}>+ Novo Usuário</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-workshop-700 border-t-workshop-accent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-zinc-100">{user.name}</p>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
                <span className="rounded-full border border-workshop-600 px-2 py-0.5 text-xs capitalize text-workshop-accent">
                  {user.role}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1 !py-2 !text-xs" onClick={() => openEdit(user)}>
                  Editar
                </Button>
                <Button variant="danger" className="flex-1 !py-2 !text-xs" onClick={() => openDelete(user)}>
                  Excluir
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="col-span-full py-8 text-center text-zinc-500">Nenhum usuário cadastrado</p>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        footer={
          <ModalActions
            onCancel={() => setModalOpen(false)}
            onConfirm={handleSubmit}
            loading={saving}
            confirmLabel={selectedUser ? 'Atualizar' : 'Cadastrar'}
          />
        }
      >
        <div className="space-y-4">
          <Input label="Nome" name="name" value={form.name} onChange={handleChange} required />
          <Input label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input
            label={selectedUser ? 'Nova Senha (opcional)' : 'Senha'}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={formErrors.password}
            placeholder={selectedUser ? 'Deixe em branco para manter' : 'Mín. 8 chars, maiúsc, minúsc, número'}
          />
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Perfil
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir usuário"
        message={`Tem certeza que deseja excluir "${selectedUser?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />
    </div>
  );
}
