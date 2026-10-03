import api from './api.js';

export const reflectionService = {
  getToday: (date) => api.get('/reflections/today', { params: { date } }),
  saveReflection: (data) => api.post('/reflections', data),
  getHistory: (limit = 30) => api.get('/reflections/history', { params: { limit } }),
};
