import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldAlert,
  Flame,
  Target,
  Sparkles,
  Zap,
} from 'lucide-react';

export const JarvisMessageWidgets = ({ widget }) => {
  if (!widget || !widget.widgetType) return null;

  const { widgetType, title, data = {} } = widget;

  return (
    <div className="my-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-3.5 shadow-sm">
      {title && (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>{title}</span>
        </div>
      )}

      {/* 1. Schedule Plan Timeline */}
      {widgetType === 'schedule_plan' && data.planItems && (
        <div className="space-y-2">
          {data.planItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded">
                <Clock className="w-3 h-3" />
                <span>{item.scheduledTime}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span>{item.durationMinutes} min</span>
                  {item.category && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{item.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Interactive Checklist */}
      {widgetType === 'checklist' && data.items && (
        <ChecklistWidget items={data.items} />
      )}

      {/* 3. Progress Card */}
      {widgetType === 'progress_card' && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 dark:text-slate-400">Consistency Rate</span>
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
              {data.completionRate || 0}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, data.completionRate || 0))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Completed {data.recentCompletions || 0} of {data.totalWindow || 7} days
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              Target window
            </span>
          </div>
        </div>
      )}

      {/* 4. Habit Proposal */}
      {widgetType === 'habit_proposal' && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Habit Name</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{data.name}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Daily Target</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {data.target} {data.unit}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Preferred Time</span>
            <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{data.preferredTime}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Cadence</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Daily Routine</span>
          </div>
        </div>
      )}

      {/* 5. Habit Stack Proposal */}
      {widgetType === 'stack_card' && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 text-xs">
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block">Anchor Cue</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">After {data.cue}</span>
          </div>
          <span className="text-cyan-500 font-bold text-base">→</span>
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">Routine</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{data.routine}</span>
          </div>
        </div>
      )}

      {/* 6. Personal Rule Card */}
      {widgetType === 'rule_card' && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[11px] mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Non-Negotiable Personal Rule</span>
          </div>
          <div className="font-medium italic text-slate-800 dark:text-slate-200">
            "{data.ruleText}"
          </div>
        </div>
      )}

      {/* 7. Recovery Plan */}
      {widgetType === 'recovery_plan' && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <span className="font-medium text-slate-700 dark:text-slate-300">Target Reduction</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">-{data.reductionPct || 50}%</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <span className="font-medium text-slate-700 dark:text-slate-300">Protocol Duration</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.durationDays || 3} Days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Lowers friction to rebuild the psychological activation loop.
          </p>
        </div>
      )}

      {/* 8. Weekly Performance Matrix */}
      {widgetType === 'weekly_summary' && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Consistency</span>
            <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">{data.rate || 0}%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Focus Logged</span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{data.focusMins || 0} min</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ChecklistWidget = ({ items = [] }) => {
  const [checkedState, setCheckedState] = useState(
    items.map((i) => Boolean(i.done))
  );

  const toggleItem = (idx) => {
    setCheckedState((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => {
        const isDone = checkedState[idx];
        return (
          <button
            key={idx}
            type="button"
            onClick={() => toggleItem(idx)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
              isDone
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                isDone
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <span className={isDone ? 'line-through opacity-70' : ''}>
              {item.text}
            </span>
          </button>
        );
      })}
    </div>
  );
};
