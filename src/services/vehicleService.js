import api from './api';

const vehicleService = {
  list: (params) => api.get('/vehicles', { params }).then((r) => r.data),
  getById: (id) => api.get(`/vehicles/${id}`).then((r) => r.data),
  getHistory: (plate) => api.get(`/vehicles/plate/${plate}/history`).then((r) => r.data),
  create: (data) => api.post('/vehicles', data).then((r) => r.data),
  update: (id, data) => api.put(`/vehicles/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/vehicles/${id}`),
};

export default vehicleService;
