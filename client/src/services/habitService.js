import api from './api.js';

export const habitService = {
  getHabits: (params) => api.get('/habits', { params }),
  createHabit: (data) => api.post('/habits', data),
  getHabitById: (id) => api.get(`/habits/${id}`),
  updateHabit: (id, data) => api.put(`/habits/${id}`, data),
  deleteHabit: (id, permanent = false) =>
    api.delete(`/habits/${id}`, { params: { permanent } }),
  togglePause: (id) => api.patch(`/habits/${id}/pause`),
  reorderHabits: (habitOrders) => api.post('/habits/reorder', { habitOrders }),
  logHabit: (id, data) => api.post(`/habits/${id}/log`, data),
  getHistory: (id, days = 30) => api.get(`/habits/${id}/history`, { params: { days } }),
  acceptAdaptation: (id) => api.post(`/habits/${id}/adaptation/accept`),
  dismissAdaptation: (id) => api.post(`/habits/${id}/adaptation/dismiss`),
};
