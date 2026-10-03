import api from './api.js';

export const aiService = {
  getInsights: () => api.get('/ai/insights'),
};
