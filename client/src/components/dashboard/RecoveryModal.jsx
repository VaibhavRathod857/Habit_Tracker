import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { RotateCcw, HeartHandshake, ShieldCheck } from 'lucide-react';

export const RecoveryModal = ({ isOpen, onClose, onActivate, currentRecovery }) => {
  const [durationDays, setDurationDays] = useState(3);
  const [targetReductionPct, setTargetReductionPct] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onActivate(Number(durationDays), Number(targetReductionPct));
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
      title="Recovery Mode: The Gentle Restart"
      subtitle="Consistency > Guilt. Reset friction to re-enter your routine."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Why Recovery Mode Works</span>
          </div>
          <p className="leading-relaxed">
            When you miss several days, returning to high expectations triggers resistance.
            Temporarily shrinking targets gives your brain an easy win, instantly breaking inertia.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Reduction Percentage
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[30, 50, 75].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTargetReductionPct(pct)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  targetReductionPct === pct
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                -{pct}% Target
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Recovery Duration (Days)
          </label>
          <select
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="2">2 Days (Quick Weekend Reset)</option>
            <option value="3">3 Days (Recommended Standard)</option>
            <option value="5">5 Days (Deep Momentum Rebuild)</option>
            <option value="7">7 Days (Full Reset Week)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="recovery"
            size="md"
            type="submit"
            icon={RotateCcw}
            isLoading={loading}
          >
            Activate Recovery Mode
          </Button>
        </div>
      </form>
    </Modal>
  );
};
