import api from './api';

const itemService = {
  async list() {
    const { data } = await api.get('/motos');
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/motos/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/motos', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/motos/${id}`, payload);
    return data;
  },

  async remove(id) {
    await api.delete(`/motos/${id}`);
  },
};

export default itemService;
