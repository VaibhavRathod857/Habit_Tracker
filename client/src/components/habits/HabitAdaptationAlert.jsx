import React from 'react';
import { Sliders, Check, X } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const HabitAdaptationAlert = ({ habit, onAccept, onDismiss }) => {
  const adaptation = habit.adaptationSuggestion;
  if (!adaptation || adaptation.status !== 'pending') return null;

  return (
    <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 shadow-sm mb-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 mt-0.5">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
              Adaptive Habit Suggestion: {habit.name}
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5 leading-relaxed">
              {adaptation.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(habit._id)}
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
          >
            Keep Target
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            onClick={() => onAccept(habit._id)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept {adaptation.suggestedTarget} {habit.target?.unit}
          </Button>
        </div>
      </div>
    </div>
  );
};
