import api from './api.js';

export const dashboardService = {
  getDashboardData: () => api.get('/dashboard'),
};
