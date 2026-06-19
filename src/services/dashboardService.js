import api from './api';

const dashboardService = {
  summary: () => api.get('/dashboard/summary').then((r) => r.data),
};

export default dashboardService;
