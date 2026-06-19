import api from './api';

const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async getProfile() {
    const { data } = await api.get('/auth/profile');
    return data.user;
  },
};

export default authService;
