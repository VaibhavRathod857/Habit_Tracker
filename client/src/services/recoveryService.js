import api from './api.js';

export const recoveryService = {
  getStatus: () => api.get('/recovery/status'),
  activateRecovery: (durationDays, targetReductionPct) =>
    api.post('/recovery/activate', { durationDays, targetReductionPct }),
  completeRecovery: () => api.post('/recovery/complete'),
  toggleBadDay: (notes) => api.post('/recovery/bad-day', { notes }),
};
