import api from './api.js';

export const focusService = {
  logSession: (data) => api.post('/focus/complete', data),
  getHistory: (limit = 30) => api.get('/focus/history', { params: { limit } }),
  getStats: () => api.get('/focus/stats'),
};
