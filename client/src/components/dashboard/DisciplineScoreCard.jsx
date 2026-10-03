import React from 'react';
import { Activity, Check, Timer, Calendar, BookOpen, Info } from 'lucide-react';

export const DisciplineScoreCard = ({ scoreData }) => {
  if (!scoreData) return null;

  const { totalScore, breakdown, message } = scoreData;

  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Discipline Score
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Behavioral Momentum</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalScore}
            </span>
            <span className="text-xs text-slate-400 font-semibold"> / 100</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, totalScore)}%` }}
          />
        </div>

        {/* Breakdown Items */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Habits
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {breakdown.habits.score}/40
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-blue-500" /> Focus
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {breakdown.focus.score}/25
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Tasks
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {breakdown.tasks.score}/20
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Review
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {breakdown.reflection.score}/15
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        "{message}"
      </p>
    </div>
  );
};
