import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Timer, Zap, History, Coffee, AlertCircle } from 'lucide-react';
import { focusService } from '../services/focusService.js';
import { habitService } from '../services/habitService.js';
import { taskService } from '../services/taskService.js';
import { useToast } from '../context/ToastContext.jsx';
import { PomodoroTimer } from '../components/focus/PomodoroTimer.jsx';

export const FocusPage = () => {
  const [searchParams] = useSearchParams();
  const defaultHabitId = searchParams.get('habitId') || '';
  const { success: toastSuccess, error: toastError } = useToast();

  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    totalHours: '0.0',
    todayMinutes: 0,
    totalSessions: 0,
    totalDistractions: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [hRes, tRes, histRes, statsRes] = await Promise.all([
        habitService.getHabits({}),
        taskService.getTasks(),
        focusService.getHistory(15),
        focusService.getStats(),
      ]);

      if (hRes.success) setHabits(hRes.data);
      if (tRes.success) setTasks(tRes.data);
      if (histRes.success) setHistory(histRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSessionComplete = async (sessionData) => {
    try {
      const res = await focusService.logSession(sessionData);
      toastSuccess(res.message || 'Focus session logged!');
      await loadData();
    } catch (err) {
      toastError(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Deep Focus Mode
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Single-tasking builds neuroplasticity. Eliminate external triggers and lock in.
        </p>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
            {stats.todayMinutes}m
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Today's Focus
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalHours}h
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Total Hours Logged
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalSessions}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Completed Blocks
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-amber-500">
            {stats.totalDistractions}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Distractions Caught
          </p>
        </div>
      </div>

      {/* Main Interactive Timer */}
      <PomodoroTimer
        habits={habits}
        tasks={tasks}
        defaultHabitId={defaultHabitId}
        onSessionComplete={handleSessionComplete}
      />

      {/* Recent History Table */}
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <History className="w-4 h-4 text-brand-500" /> Recent Focus Sessions
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No focus sessions logged yet. Hit "Start Focus" above to begin your first session.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {history.map((s) => (
              <div key={s._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {s.date} • {s.type} {s.linkedHabit ? `• ${s.linkedHabit.name}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">
                    +{s.durationMinutes} min
                  </span>
                  {s.distractionCount > 0 && (
                    <span className="block text-[10px] text-amber-500">
                      {s.distractionCount} distractions
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
