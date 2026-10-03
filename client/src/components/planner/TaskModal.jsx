import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';

export const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  task = null,
  habits = [],
  goals = [],
  currentDate,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    estimatedDurationMinutes: 30,
    priority: 'medium',
    linkedGoal: '',
    linkedHabit: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        scheduledTime: task.scheduledTime || '',
        estimatedDurationMinutes: task.estimatedDurationMinutes || 30,
        priority: task.priority || 'medium',
        linkedGoal: task.linkedGoal?._id || task.linkedGoal || '',
        linkedHabit: task.linkedHabit?._id || task.linkedHabit || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        scheduledTime: '09:00',
        estimatedDurationMinutes: 30,
        priority: 'medium',
        linkedGoal: '',
        linkedHabit: '',
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        ...formData,
        date: currentDate,
        estimatedDurationMinutes: Number(formData.estimatedDurationMinutes),
        linkedGoal: formData.linkedGoal || null,
        linkedHabit: formData.linkedHabit || null,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Scheduled Task' : 'Plan New Task'}
      subtitle="Time-block your day to remove decision fatigue."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Graph Traversal Problems, Client Presentation"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Scheduled Time & Estimated Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Scheduled Time (24h)
            </label>
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Duration (Mins)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={formData.estimatedDurationMinutes}
              onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFormData({ ...formData, priority: p })}
                className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  formData.priority === p
                    ? p === 'high'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                      : p === 'medium'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Link Habit & Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link to Habit (Optional)
            </label>
            <select
              value={formData.linkedHabit}
              onChange={(e) => setFormData({ ...formData, linkedHabit: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">None</option>
              {habits.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link to Goal (Optional)
            </label>
            <select
              value={formData.linkedGoal}
              onChange={(e) => setFormData({ ...formData, linkedGoal: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">None</option>
              {goals.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={loading}>
            {task ? 'Update Task' : 'Add to Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
