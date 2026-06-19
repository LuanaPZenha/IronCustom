import api from './api';

const partService = {
  list: () => api.get('/parts').then((r) => r.data),
  lowStock: () => api.get('/parts/low-stock').then((r) => r.data),
  getById: (id) => api.get(`/parts/${id}`).then((r) => r.data),
  create: (data) => api.post('/parts', data).then((r) => r.data),
  update: (id, data) => api.put(`/parts/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/parts/${id}`),
};

export default partService;
