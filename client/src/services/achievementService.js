import api from './api.js';

export const achievementService = {
  getAchievements: () => api.get('/achievements'),
};
