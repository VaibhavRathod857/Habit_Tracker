import api from './api.js';

export const reviewService = {
  generateWeekly: () => api.get('/reviews/generate'),
  saveWeekly: (data) => api.post('/reviews', data),
  getReviews: () => api.get('/reviews/history'),
};
