import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Flame,
  Plus,
  Play,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { triggerSubtleConfetti } from '../common/ConfettiCelebration.js';

export const TodayHabitsList = ({
  habits,
  onLogProgress,
  onOpenLogModal,
  onStartFocus,
  onAddHabit,
}) => {
  const handleQuickToggle = (habit) => {
    const isCompleted = habit.todayLog.isCompleted;
    const targetVal = habit.target.value;
    const nextVal = isCompleted ? 0 : targetVal;

    onLogProgress(habit._id, nextVal);
    if (!isCompleted) {
      triggerSubtleConfetti();
    }
  };

  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Today's Disciplines
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {habits.filter((h) => h.todayLog.isCompleted).length} of {habits.length} completed
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          onClick={onAddHabit}
          className="text-brand-600 dark:text-brand-400"
        >
          Add Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No habits scheduled for today. Click "Add Habit" to build your routine.
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const log = habit.todayLog;
            const isDone = log.isCompleted;
            const completionPct = Math.min(100, log.completionRate || 0);

            return (
              <div
                key={habit._id}
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  isDone
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/20'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkmark & Name */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleQuickToggle(habit)}
                      className={`mt-0.5 flex-shrink-0 transition-transform active:scale-90 ${
                        isDone
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : 'text-slate-300 dark:text-slate-600 hover:text-brand-500'
                      }`}
                      title={isDone ? 'Mark uncompleted' : 'Quick complete target'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {habit.name}
                        </span>

                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {habit.category}
                        </span>

                        {habit.currentStreak > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            <Flame className="w-3 h-3" />
                            {habit.currentStreak}d
                          </span>
                        )}
                      </div>

                      {habit.whyReason && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Why: {habit.whyReason}
                        </p>
                      )}

                      {/* Numeric target progress indicator */}
                      {habit.target.unit !== 'binary' && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded-full transition-all duration-300"
                              style={{ width: `${completionPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {log.actualValue} / {habit.target.value} {habit.target.unit} ({completionPct}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Modal Log / Focus Mode */}
                  <div className="flex items-center gap-1.5">
                    {habit.target.unit === 'minutes' && (
                      <button
                        onClick={() => onStartFocus(habit._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Focus Timer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenLogModal(habit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Adjust / Log Exact Value & Notes"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
