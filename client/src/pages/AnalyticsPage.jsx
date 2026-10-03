import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { BarChart2, Flame, Timer, ShieldCheck, AlertCircle } from 'lucide-react';
import { analyticsService } from '../services/analyticsService.js';
import { useToast } from '../context/ToastContext.jsx';

const RANGES = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' },
];

export const AnalyticsPage = () => {
  const { error: toastError } = useToast();
  const [selectedRange, setSelectedRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getOverview(selectedRange);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedRange]);

  const {
    dailyTrends = [],
    habitStats = [],
    lifeAreaBalance = [],
    distractionsList = [],
    metrics = {},
  } = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Consistency Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data-backed visibility into completion patterns, deep work volume, and energy leaks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRange === r.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
            {metrics.totalHabitCompletions || 0}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Total Completions
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalFocusMinutes || 0}m
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Total Focus Time
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.avgFocusPerSession || 0}m
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Avg Focus Session
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-emerald-500">
            {habitStats.length}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Active Disciplines
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Completion Rate Chart */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Daily Habit Completion Percentage (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f63e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f63e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#4f63e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rateGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Focus Time Chart */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Focus Time Logged (Minutes)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="focusMinutes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Habit Consistency Ranking & Distraction Pattern Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habit Ranking (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Habit Consistency Index ({selectedRange})
          </h3>

          <div className="space-y-3">
            {habitStats.map((h) => (
              <div key={h.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{h.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">
                      {h.completedCount}/{h.scheduledCount} sessions
                    </span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {h.consistency}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-300"
                    style={{ width: `${h.consistency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distraction Frequency (1 col) */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Distraction Analytics
          </h3>

          {distractionsList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No distractions recorded in daily reflections.
            </p>
          ) : (
            <div className="space-y-2.5">
              {distractionsList.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">{d.name}</span>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600">
                    {d.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
