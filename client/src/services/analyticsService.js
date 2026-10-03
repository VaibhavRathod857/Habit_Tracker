import api from './api.js';

export const analyticsService = {
  getOverview: (range = '30d') => api.get('/analytics/overview', { params: { range } }),
  getHeatmap: () => api.get('/analytics/heatmap'),
  getDayDetails: (date) => api.get(`/analytics/day/${date}`),
};
