import api from './api';

const serviceOrderService = {
  list: (params) => api.get('/service-orders', { params }).then((r) => r.data),
  kanban: () => api.get('/service-orders/kanban').then((r) => r.data),
  getById: (id) => api.get(`/service-orders/${id}`).then((r) => r.data),
  create: (data) => api.post('/service-orders', data).then((r) => r.data),
  update: (id, data) => api.put(`/service-orders/${id}`, data).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/service-orders/${id}/status`, { status }).then((r) => r.data),
  updatePayment: (id, payment) => api.patch(`/service-orders/${id}/payment`, payment).then((r) => r.data),
  convertBudget: (id) => api.post(`/service-orders/${id}/convert`).then((r) => r.data),
  remove: (id) => api.delete(`/service-orders/${id}`),
  commissions: (params) => api.get('/service-orders/commissions', { params }).then((r) => r.data),
};

export default serviceOrderService;
