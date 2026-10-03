import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Play, Flame, ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const NowNextCard = ({
  actionPriority,
  onStartFocus,
  onOpenHabitLog,
  onOpenReflection,
}) => {
  const now = actionPriority?.now;
  const next = actionPriority?.next;

  if (!now) return null;

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-brand-600/10 via-brand-500/5 to-transparent border border-brand-500/20 shadow-sm relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* NOW Block */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-600 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> WHAT TO DO NOW
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {now.title}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
            {now.subtitle}
          </p>
        </div>

        {/* Action Button for NOW */}
        <div className="flex items-center gap-2">
          {now.type === 'habit' && (
            <>
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle2}
                onClick={() => onOpenHabitLog(now.habitId)}
              >
                Log Progress
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={Play}
                onClick={() => onStartFocus(now.habitId)}
              >
                Focus Timer
              </Button>
            </>
          )}

          {now.type === 'scheduled_task' && (
            <Button
              variant="primary"
              size="md"
              icon={CheckCircle2}
              onClick={() => onOpenHabitLog()}
            >
              Mark Done
            </Button>
          )}

          {now.type === 'reflection' && (
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              onClick={onOpenReflection}
            >
              Start Evening Review
            </Button>
          )}

          {now.type === 'bad_day_action' && (
            <Button
              variant="primary"
              size="md"
              icon={ShieldAlert}
              onClick={() => (now.habitId ? onOpenHabitLog(now.habitId) : null)}
            >
              Take Gentle Action
            </Button>
          )}
        </div>
      </div>

      {/* NEXT Sub-bar */}
      {next && (
        <div className="mt-4 pt-3.5 border-t border-brand-500/10 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider text-[10px]">
            NEXT UP:
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {next.title}
          </span>
          <span className="text-slate-400">({next.subtitle})</span>
        </div>
      )}
    </div>
  );
};
