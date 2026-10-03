import api from './api.js';

export const taskService = {
  getTasks: (date) => api.get('/tasks', { params: { date } }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  toggleComplete: (id) => api.patch(`/tasks/${id}/toggle`),
  reorderTasks: (taskOrders) => api.post('/tasks/reorder', { taskOrders }),
};
