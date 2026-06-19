export const OS_STATUSES = {
  awaiting_evaluation: { label: 'Aguardando Avaliação', color: 'bg-zinc-600' },
  awaiting_approval: { label: 'Aguardando Aprovação', color: 'bg-yellow-700' },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-700' },
  awaiting_part: { label: 'Aguardando Peça', color: 'bg-purple-700' },
  completed: { label: 'Concluído', color: 'bg-emerald-700' },
  delivered: { label: 'Entregue', color: 'bg-workshop-accent' },
};

export const OS_STATUS_ORDER = [
  'awaiting_evaluation',
  'awaiting_approval',
  'in_progress',
  'awaiting_part',
  'completed',
  'delivered',
];

export const PAYMENT_METHODS = {
  pix: 'Pix',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  '': 'Não informado',
};

export const FUEL_LEVELS = {
  '': 'Não informado',
  empty: 'Vazio',
  '1/4': '1/4',
  '1/2': '1/2',
  '3/4': '3/4',
  full: 'Cheio',
};

export const PROJECT_STATUSES = {
  planning: { label: 'Planejamento', color: 'bg-zinc-600' },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-700' },
  completed: { label: 'Concluído', color: 'bg-emerald-700' },
};

export const DEFAULT_PROJECT_STEPS = [
  'Desmontagem',
  'Preparação do Chassi',
  'Pintura do Tanque',
  'Adaptação Custom',
  'Montagem Final',
  'Acabamento e Detalhes',
];

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}
