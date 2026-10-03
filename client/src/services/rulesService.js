import api from './api.js';

export const rulesService = {
  getRules: () => api.get('/rules-and-stacks/rules'),
  createRule: (data) => api.post('/rules-and-stacks/rules', data),
  updateRule: (id, data) => api.put(`/rules-and-stacks/rules/${id}`, data),
  deleteRule: (id) => api.delete(`/rules-and-stacks/rules/${id}`),

  getStacks: () => api.get('/rules-and-stacks/stacks'),
  createStack: (data) => api.post('/rules-and-stacks/stacks', data),
  updateStack: (id, data) => api.put(`/rules-and-stacks/stacks/${id}`, data),
  deleteStack: (id) => api.delete(`/rules-and-stacks/stacks/${id}`),
};
