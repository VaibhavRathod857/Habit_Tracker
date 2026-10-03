import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { aiService } from '../services/aiService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const AICoachPage = () => {
  const { error: toastError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await aiService.getInsights();
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
    fetchInsights();
  }, []);

  const { summary, insights = [], metrics = {} } = data || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mb-1">
            <Sparkles className="w-3 h-3" /> Data-Grounded Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Consistency Coach
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Non-judgmental diagnostic recommendations based on your actual logs, focus blocks, and friction points.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={fetchInsights}
          isLoading={loading}
        >
          Re-Analyze
        </Button>
      </div>

      {/* Summary Banner */}
      {summary && (
        <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/60 text-xs text-brand-900 dark:text-brand-200 font-medium">
          {summary}
        </div>
      )}

      {/* Insights Cards List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Analyzing user behavioral signals...
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl ${
                      insight.type === 'strength'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                        : insight.type === 'calibration'
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-600'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-600'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {insight.title}
                  </h3>
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {insight.type}
                </span>
              </div>

              {/* Observation */}
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Observation: </span>
                {insight.observation}
              </div>

              {/* Rationale */}
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                <span className="font-semibold not-italic text-slate-700 dark:text-slate-300">
                  Why this insight:
                </span>{' '}
                {insight.rationale}
              </div>

              {/* Suggestion */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-brand-700 dark:text-brand-300 font-medium">
                <span className="font-bold">Recommended action: </span>
                {insight.suggestion}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
