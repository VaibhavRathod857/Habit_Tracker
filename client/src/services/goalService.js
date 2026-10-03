import api from './api.js';

export const goalService = {
  getGoals: (params) => api.get('/goals', { params }),
  createGoal: (data) => api.post('/goals', data),
  getGoalById: (id) => api.get(`/goals/${id}`),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  toggleMilestone: (goalId, milestoneId) =>
    api.patch(`/goals/${goalId}/milestones/${milestoneId}`),
};
