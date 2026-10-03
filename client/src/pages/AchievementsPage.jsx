import React, { useState, useEffect } from 'react';
import { Award, Trophy, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { achievementService } from '../services/achievementService.js';
import { useToast } from '../context/ToastContext.jsx';

export const AchievementsPage = () => {
  const { error: toastError } = useToast();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const res = await achievementService.getAchievements();
        if (res.success && res.data) {
          setAchievements(res.data);
        }
      } catch (err) {
        toastError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
  }, []);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Consistency Milestones
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Meaningful badges recognizing behavioral momentum, focus volume, and resilience.
        </p>
      </div>

      {/* Progress banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {unlockedCount} of {achievements.length} Badges Unlocked
          </span>
        </div>
        <div className="w-40 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{
              width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading achievements...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((item) => (
            <div
              key={item.code}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                item.isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-amber-500/30 shadow-sm shadow-amber-500/5'
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.isUnlocked
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.isUnlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.isUnlocked
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.isUnlocked ? 'Unlocked' : `${item.progress}%`}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {!item.isUnlocked && (
                <div className="mt-4 pt-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
