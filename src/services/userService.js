import api from './api';

const userService = {
  async list() {
    const { data } = await api.get('/users');
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/users', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  async remove(id) {
    await api.delete(`/users/${id}`);
  },
};

export default userService;
