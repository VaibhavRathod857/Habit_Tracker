import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';

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

const TARGET_UNITS = [
  { label: 'Yes / No (Binary)', value: 'binary' },
  { label: 'Minutes', value: 'minutes' },
  { label: 'Hours', value: 'hours' },
  { label: 'Pages', value: 'pages' },
  { label: 'Reps', value: 'reps' },
  { label: 'Kilometers (km)', value: 'km' },
  { label: 'Custom', value: 'custom' },
];

export const HabitModal = ({ isOpen, onClose, onSave, habit = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Personal development',
    color: '#4f63e9',
    frequencyType: 'daily',
    targetValue: 1,
    targetUnit: 'binary',
    customUnit: '',
    preferredTime: 'anytime',
    difficulty: 'medium',
    whyReason: '',
    isMinimumViable: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        category: habit.category || 'Personal development',
        color: habit.color || '#4f63e9',
        frequencyType: habit.frequency?.type || 'daily',
        targetValue: habit.target?.value || 1,
        targetUnit: habit.target?.unit || 'binary',
        customUnit: habit.target?.customUnit || '',
        preferredTime: habit.preferredTime || 'anytime',
        difficulty: habit.difficulty || 'medium',
        whyReason: habit.whyReason || '',
        isMinimumViable: Boolean(habit.isMinimumViable),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'Personal development',
        color: '#4f63e9',
        frequencyType: 'daily',
        targetValue: 1,
        targetUnit: 'binary',
        customUnit: '',
        preferredTime: 'anytime',
        difficulty: 'medium',
        whyReason: '',
        isMinimumViable: false,
      });
    }
  }, [habit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        color: formData.color,
        frequency: {
          type: formData.frequencyType,
        },
        target: {
          value: Number(formData.targetValue) || 1,
          unit: formData.targetUnit,
          customUnit: formData.customUnit,
        },
        preferredTime: formData.preferredTime,
        difficulty: formData.difficulty,
        whyReason: formData.whyReason.trim(),
        isMinimumViable: formData.isMinimumViable,
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
      title={habit ? 'Edit Discipline' : 'Build New Habit'}
      subtitle="Define a measurable routine grounded in personal purpose."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Habit Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Deep DSA Practice, Morning Workout, Reading"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Category & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Life Area / Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="easy">Easy (Low Resistance)</option>
              <option value="medium">Medium (Moderate Effort)</option>
              <option value="hard">Hard (High Focus Required)</option>
            </select>
          </div>
        </div>

        {/* Target Value & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Type
            </label>
            <select
              value={formData.targetUnit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetUnit: e.target.value,
                  targetValue: e.target.value === 'binary' ? 1 : formData.targetValue,
                })
              }
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {TARGET_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daily Target Amount
            </label>
            <input
              type="number"
              min="1"
              disabled={formData.targetUnit === 'binary'}
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            />
          </div>
        </div>

        {formData.targetUnit === 'custom' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Unit Name
            </label>
            <input
              type="text"
              placeholder="e.g. glasses, articles, sessions"
              value={formData.customUnit}
              onChange={(e) => setFormData({ ...formData, customUnit: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}

        {/* Frequency & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Frequency Cadence
            </label>
            <select
              value={formData.frequencyType}
              onChange={(e) => setFormData({ ...formData, frequencyType: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="daily">Daily (Every Day)</option>
              <option value="weekdays">Weekdays (Mon-Fri)</option>
              <option value="weekends">Weekends (Sat-Sun)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Time of Day
            </label>
            <select
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>
        </div>

        {/* Why Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Personal Reason / The WHY (Anchor Motivation)
          </label>
          <input
            type="text"
            value={formData.whyReason}
            onChange={(e) => setFormData({ ...formData, whyReason: e.target.value })}
            placeholder="e.g. Master algorithms to provide for my family; maintain stamina."
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Minimum Viable Habit Checkbox */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <input
            type="checkbox"
            id="minViable"
            checked={formData.isMinimumViable}
            onChange={(e) => setFormData({ ...formData, isMinimumViable: e.target.checked })}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="minViable" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <span className="font-semibold">Minimum Viable Habit:</span> Include in Bad Day &amp; Recovery Mode baselines.
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={loading}>
            {habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
