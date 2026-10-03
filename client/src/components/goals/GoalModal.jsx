import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'Career',
  'Study',
  'Fitness',
  'Health',
  'Mental wellbeing',
  'Reading',
  'Finance',
  'Relationships',
  'Personal development',
  'Sleep',
  'Other',
];

export const GoalModal = ({ isOpen, onClose, onSave, goal = null, habits = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Career',
    priority: 'medium',
    deadline: '',
    linkedHabits: [],
    milestones: [],
  });

  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'Career',
        priority: goal.priority || 'medium',
        deadline: goal.deadline ? goal.deadline.slice(0, 10) : '',
        linkedHabits: (goal.linkedHabits || []).map((h) => h._id || h),
        milestones: goal.milestones || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Career',
        priority: 'medium',
        deadline: '',
        linkedHabits: [],
        milestones: [],
      });
    }
  }, [goal, isOpen]);

  const addMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: newMilestoneText.trim(), isCompleted: false }],
    });
    setNewMilestoneText('');
  };

  const removeMilestone = (idx) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== idx),
    });
  };

  const toggleLinkedHabit = (habitId) => {
    if (formData.linkedHabits.includes(habitId)) {
      setFormData({
        ...formData,
        linkedHabits: formData.linkedHabits.filter((id) => id !== habitId),
      });
    } else {
      setFormData({
        ...formData,
        linkedHabits: [...formData.linkedHabits, habitId],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        ...formData,
        deadline: formData.deadline || null,
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
      title={goal ? 'Edit Goal' : 'Define Long-Term Goal'}
      subtitle="Anchor your daily habits into overarching ambitions."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Goal Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Become Placement Ready, Run 10K, Read 12 Books"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Outcome Criteria
          </label>
          <textarea
            rows="2"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What does success look like once completed?"
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Category & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Linked Habits */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Linked Daily Habits (Drivers of this goal)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {habits.length === 0 ? (
              <span className="text-xs text-slate-400">No habits available to link.</span>
            ) : (
              habits.map((h) => {
                const isSelected = formData.linkedHabits.includes(h._id);
                return (
                  <button
                    key={h._id}
                    type="button"
                    onClick={() => toggleLinkedHabit(h._id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {h.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Milestones List */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Milestones
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Complete Dynamic Programming patterns"
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMilestone();
                }
              }}
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button variant="secondary" size="sm" onClick={addMilestone} type="button">
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {formData.milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 truncate">{m.title}</span>
                <button
                  type="button"
                  onClick={() => removeMilestone(idx)}
                  className="text-slate-400 hover:text-rose-500 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={loading}>
            {goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
