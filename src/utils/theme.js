/** Imagens locais — galeria 100% motos custom / oficina mecânica */
export const MOTO_IMAGES = {
  login: '/images/heroes/login.jpg',
  dashboard: '/images/heroes/dashboard.jpg',
  serviceOrders: '/images/heroes/service-orders.jpg',
  clients: '/images/heroes/clients.jpg',
  inventory: '/images/heroes/inventory.jpg',
  projects: '/images/heroes/projects.jpg',
  finance: '/images/heroes/finance.jpg',
  users: '/images/heroes/users.jpg',
  sidebar: '/images/heroes/sidebar.jpg',
};

/** 24 fotos temáticas — ver scripts/download-moto-images.ps1 */
export const CARD_IMAGES = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `/images/cards/${num}.jpg`;
});

export function cardImage(index = 0) {
  return CARD_IMAGES[Math.abs(index) % CARD_IMAGES.length];
}

export function cardImageFromId(id, offset = 0) {
  if (!id) return cardImage(offset);
  const str = String(id);
  let hash = offset;
  for (let i = 0; i < str.length; i += 1) {
    hash += str.charCodeAt(i);
  }
  return cardImage(hash);
}

/** Cards de navegação do dashboard */
export const MODULE_CARD_IMAGES = {
  serviceOrders: '/images/cards/01.jpg',
  clients: '/images/cards/12.jpg',
  inventory: '/images/cards/13.jpg',
  projects: '/images/cards/07.jpg',
  finance: '/images/cards/04.jpg',
  users: '/images/cards/08.jpg',
};

/** Colunas do kanban de OS — imagem fixa por status */
export const KANBAN_COLUMN_IMAGES = {
  awaiting_evaluation: '/images/cards/16.jpg',
  awaiting_approval: '/images/cards/02.jpg',
  in_progress: '/images/cards/01.jpg',
  awaiting_part: '/images/cards/13.jpg',
  completed: '/images/cards/07.jpg',
  delivered: '/images/cards/19.jpg',
};

/** Seção de orçamentos pendentes */
export const BUDGETS_SECTION_IMAGE = '/images/cards/06.jpg';
