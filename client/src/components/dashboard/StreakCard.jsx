import React from 'react';
import { Flame, Trophy, ShieldCheck, HeartHandshake } from 'lucide-react';

export const StreakCard = ({ streaks }) => {
  const current = streaks?.current || 0;
  const best = streaks?.best || 0;
  const consistency = streaks?.overallConsistency || 0;

  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Consistency & Momentum
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Streak & Long-Term Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center py-1">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{current}d</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Current</p>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-0.5">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{best}d</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Best</p>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{consistency}%</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">30d Rate</p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <HeartHandshake className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
        <span>
          A broken streak never resets your neurological gains. Your overall consistency is {consistency}%.
        </span>
      </div>
    </div>
  );
};
