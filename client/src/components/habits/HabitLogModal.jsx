import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { triggerSubtleConfetti } from '../common/ConfettiCelebration.js';

const MOODS = [
  { label: 'Great 🔥', value: 'great' },
  { label: 'Good 👍', value: 'good' },
  { label: 'Neutral 😐', value: 'neutral' },
  { label: 'Tired 🥱', value: 'tired' },
  { label: 'Stressed ⚡', value: 'stressed' },
];

export const HabitLogModal = ({ isOpen, onClose, habit, onSaveLog }) => {
  const [actualValue, setActualValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('good');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habit && habit.todayLog) {
      setActualValue(habit.todayLog.actualValue || 0);
      setNotes(habit.todayLog.notes || '');
      setMood(habit.todayLog.mood || 'good');
    } else {
      setActualValue(0);
      setNotes('');
      setMood('good');
    }
  }, [habit, isOpen]);

  if (!habit) return null;

  const targetVal = habit.target?.value || 1;
  const completionRate = targetVal > 0 ? Math.round((Number(actualValue) / targetVal) * 100) : 0;
  const isComplete = Number(actualValue) >= targetVal;

  const handleIncrement = (delta) => {
    setActualValue((prev) => Math.max(0, Number(prev) + delta));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSaveLog(habit._id, {
        actualValue: Number(actualValue),
        notes,
        mood,
      });
      if (isComplete) {
        triggerSubtleConfetti();
      }
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
      title={`Log Progress: ${habit.name}`}
      subtitle={`Daily Target: ${targetVal} ${habit.target?.unit}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Actual Value Controls */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Completed Amount ({habit.target?.unit})
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={actualValue}
              onChange={(e) => setActualValue(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-lg font-bold text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {habit.target?.unit === 'minutes' && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleIncrement(15)}
                  className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => handleIncrement(30)}
                  className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                >
                  +30m
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Completion Badge & Bar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Progress</span>
            <span className={isComplete ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}>
              {completionRate}% {isComplete && '✓ Target Met!'}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isComplete ? 'bg-emerald-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(100, completionRate)}%` }}
            />
          </div>
        </div>

        {/* Mood Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            How was your state / mood during this habit?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`px-2 py-2 rounded-xl text-xs font-medium text-center border transition-all ${
                  mood === m.value
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Observations (Optional)
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Solved two graph medium problems, energy was sharp."
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={loading}>
            Save Log
          </Button>
        </div>
      </form>
    </Modal>
  );
};
