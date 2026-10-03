import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { triggerSubtleConfetti } from '../common/ConfettiCelebration.js';

const DISTRACTION_OPTIONS = [
  'Social media',
  'YouTube',
  'Gaming',
  'Phone',
  'Friends',
  'Tiredness',
  'Stress',
  'Unexpected work',
  'Other',
];

const MOODS = [
  { label: 'Great 🔥', value: 'great' },
  { label: 'Good 👍', value: 'good' },
  { label: 'Neutral 😐', value: 'neutral' },
  { label: 'Low 🌧️', value: 'low' },
  { label: 'Exhausted 🔋', value: 'exhausted' },
];

export const DailyReflectionModal = ({
  isOpen,
  onClose,
  initialReflection = null,
  onSave,
}) => {
  const [wentWell, setWentWell] = useState('');
  const [distractions, setDistractions] = useState([]);
  const [improvements, setImprovements] = useState('');
  const [mood, setMood] = useState('good');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialReflection) {
      setWentWell(initialReflection.wentWell || '');
      setDistractions(initialReflection.distractions || []);
      setImprovements(initialReflection.improvements || '');
      setMood(initialReflection.mood || 'good');
      setEnergyLevel(initialReflection.energyLevel || 3);
    } else {
      setWentWell('');
      setDistractions([]);
      setImprovements('');
      setMood('good');
      setEnergyLevel(3);
    }
  }, [initialReflection, isOpen]);

  const toggleDistraction = (item) => {
    if (distractions.includes(item)) {
      setDistractions(distractions.filter((d) => d !== item));
    } else {
      setDistractions([...distractions, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        wentWell,
        distractions,
        improvements,
        mood,
        energyLevel: Number(energyLevel),
      });
      triggerSubtleConfetti();
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
      title="Daily Evening Reflection"
      subtitle="Close your feedback loop: reflect without judgment, adjust for tomorrow."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Went Well */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            1. What went well today? (Celebrate your execution)
          </label>
          <textarea
            rows="2"
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            placeholder="e.g. Completed 60 min DSA practice and resisted late morning snacks."
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Distractions Checklist */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            2. What caused friction or distraction today?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DISTRACTION_OPTIONS.map((item) => {
              const selected = distractions.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDistraction(item)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    selected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Improvements */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            3. What is one small adjustment for tomorrow?
          </label>
          <textarea
            rows="2"
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="e.g. Leave phone charging across the room before opening VS Code."
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Mood & Energy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              General Mood
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Energy Level: {energyLevel} / 5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Depleted (1)</span>
              <span>High (5)</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={loading}>
            Save Reflection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
