import { useCallback, useEffect, useState } from 'react';
import projectService from '../services/projectService';
import clientService from '../services/clientService';
import vehicleService from '../services/vehicleService';
import { extractErrorMessage } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { DEFAULT_PROJECT_STEPS, PROJECT_STATUSES } from '../utils/constants';
import { MOTO_IMAGES } from '../utils/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import PageHero from '../components/PageHero';
import Modal, { ModalActions } from '../components/Modal';import ConfirmDialog from '../components/ConfirmDialog';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clientId: '', vehicleId: '', title: '', description: '', status: 'planning' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([projectService.list(), clientService.list()]);
      setProjects(p);
      setClients(c);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!form.clientId) { setVehicles([]); return; }
    vehicleService.list({ clientId: form.clientId }).then(setVehicles).catch(() => setVehicles([]));
  }, [form.clientId]);

  async function createProject() {
    setSaving(true);
    try {
      await projectService.create({
        ...form,
        steps: DEFAULT_PROJECT_STEPS.map((name) => ({ name, status: 'pending' })),
        references: [],
      });
      toast.success('Projeto criado!');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function updateStep(project, stepIdx, status) {
    const steps = project.steps.map((s, i) => {
      if (i !== stepIdx) return s;
      return { ...s, status, completedAt: status === 'done' ? new Date().toISOString() : undefined };
    });
    const allDone = steps.every((s) => s.status === 'done');
    try {
      const updated = await projectService.update(project._id, {
        steps,
        status: allDone ? 'completed' : steps.some((s) => s.status === 'in_progress') ? 'in_progress' : project.status,
      });
      setDetailProject(updated);
      load();
      toast.success('Etapa atualizada!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function addReference(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !detailProject) return;
    const refs = await Promise.all(files.map(async (f) => ({ data: await readFileAsBase64(f), caption: f.name })));
    try {
      const updated = await projectService.update(detailProject._id, {
        references: [...(detailProject.references || []), ...refs],
      });
      setDetailProject(updated);
      toast.success('Referência adicionada!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await projectService.remove(confirmDelete._id);
      toast.success('Projeto excluído!');
      setConfirmDelete(null);
      setDetailProject(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        badge="Custom Build"
        title="Projetos Custom"
        subtitle="Cafe racer, bobber, scrambler — evolução passo a passo"
        image={MOTO_IMAGES.projects}
      />
      <div className="flex justify-end">
        <Button onClick={() => { setForm({ clientId: '', vehicleId: '', title: '', description: '', status: 'planning' }); setModalOpen(true); }}>+ Novo Projeto</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-workshop-700 border-t-workshop-accent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const done = (project.steps || []).filter((s) => s.status === 'done').length;
            const total = (project.steps || []).length;
            const progress = total ? Math.round((done / total) * 100) : 0;
            return (
              <div
                key={project._id}
                className="card cursor-pointer transition hover:border-workshop-accent/50"
                onClick={() => setDetailProject(project)}
                onKeyDown={(e) => e.key === 'Enter' && setDetailProject(project)}
                role="button"
                tabIndex={0}
              >                <div className="flex items-start justify-between">
                  <h2 className="font-medium text-zinc-100">{project.title}</h2>
                  <span className={`rounded px-2 py-0.5 text-[10px] text-white ${PROJECT_STATUSES[project.status]?.color}`}>
                    {PROJECT_STATUSES[project.status]?.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{project.clientId?.name}</p>
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-workshop-800">
                    <div className="h-2 rounded-full bg-workshop-accent transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{done}/{total} etapas — {progress}%</p>
                </div>
                {(project.references || []).length > 0 && (
                  <p className="mt-2 text-xs text-zinc-500">{project.references.length} referência(s)</p>
                )}
              </div>
            );
          })}        </div>
      )}

      {detailProject && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDetailProject(null)} />
          <div className="card relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-glow">
            <div className="flex justify-between">
              <h2 className="font-display text-xl text-workshop-accent">{detailProject.title}</h2>
              <button type="button" onClick={() => setDetailProject(null)} className="text-zinc-400">✕</button>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{detailProject.description}</p>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-zinc-300">Etapas do projeto</p>
              {(detailProject.steps || []).map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-lg bg-workshop-800 px-3 py-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${step.status === 'done' ? 'bg-emerald-500' : step.status === 'in_progress' ? 'bg-blue-500' : 'bg-zinc-600'}`} />
                    <span className="flex-1 text-sm text-zinc-200">{step.name}</span>
                    <select
                      value={step.status}
                      onChange={(e) => updateStep(detailProject, idx, e.target.value)}
                      className="rounded bg-workshop-700 px-2 py-1 text-xs text-zinc-300"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em andamento</option>
                      <option value="done">Concluído</option>
                    </select>
                  </div>
                ))}
            </div>

            <div className="mt-4 rounded-lg border border-workshop-700 bg-workshop-800/50 p-3">
              <p className="mb-2 text-sm font-medium text-zinc-300">Moodboard / Referências</p>
              <input type="file" accept="image/*" multiple onChange={addReference} className="mb-2 text-xs text-zinc-400" />
              <div className="grid grid-cols-3 gap-2">
                {(detailProject.references || []).map((ref, i) => (
                  <img key={i} src={ref.data} alt={ref.caption} className="h-20 rounded object-cover" />
                ))}
              </div>
            </div>

            <Button variant="danger" className="mt-4 !text-xs" onClick={() => setConfirmDelete(detailProject)}>Excluir Projeto</Button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Projeto Custom"
        footer={<ModalActions onCancel={() => setModalOpen(false)} onConfirm={createProject} loading={saving} confirmLabel="Criar" />}>
        <div className="space-y-4">
          <Input label="Título do projeto" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required placeholder="Custom Harley Sportster" />
          <Select label="Cliente" value={form.clientId} onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}>
            <option value="">Selecione...</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
          <Select label="Veículo" value={form.vehicleId} onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))}>
            <option value="">Selecione...</option>
            {vehicles.map((v) => <option key={v._id} value={v._id}>{v.plate} — {v.brand} {v.model}</option>)}
          </Select>
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>
      </Modal>

      <ConfirmDialog isOpen={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete}
        title="Excluir projeto" message={`Excluir "${confirmDelete?.title}"?`} />
    </div>
  );
}
