import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Timer,
  ArrowRight,
  Save,
  BookOpen,
} from 'lucide-react';
import { reviewService } from '../services/reviewService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { triggerSubtleConfetti } from '../components/common/ConfettiCelebration.js';

export const WeeklyReviewPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [reviewData, setReviewData] = useState(null);
  const [pastReviews, setPastReviews] = useState([]);
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadWeeklyReview = async () => {
    try {
      const [genRes, histRes] = await Promise.all([
        reviewService.generateWeekly(),
        reviewService.getReviews(),
      ]);

      if (genRes.success && genRes.data) {
        setReviewData(genRes.data);
      }
      if (histRes.success && histRes.data) {
        setPastReviews(histRes.data);
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklyReview();
  }, []);

  const handleSaveReview = async () => {
    if (!reviewData) return;
    setSaving(true);
    try {
      await reviewService.saveWeekly({
        ...reviewData,
        userNotes,
      });
      triggerSubtleConfetti();
      toastSuccess('Weekly review finalized and archived!');
      await loadWeeklyReview();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-400">Compiling weekly metrics...</div>;
  }

  const {
    weekStartDate,
    weekEndDate,
    totalHabitsDue,
    totalHabitsCompleted,
    consistencyPercentage,
    totalFocusMinutes,
    mostConsistentHabit,
    mostMissedHabit,
    topDistraction,
    bestDay,
    keep = [],
    improve = [],
    nextWeekSuggestions = [],
  } = reviewData || {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Weekly Cadence Review
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Week of {weekStartDate} through {weekEndDate}. Evaluate trends and set calibrations for next week.
        </p>
      </div>

      {/* High Level Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
            {consistencyPercentage}%
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Consistency Rate
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {totalHabitsCompleted}/{totalHabitsDue}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Habits Executed
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {totalFocusMinutes}m
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Deep Focus Minutes
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-sm font-bold text-amber-500 truncate block mt-1">
            {topDistraction}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Primary Distraction
          </p>
        </div>
      </div>

      {/* Keep / Improve / Next Week 3-Column Framework */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KEEP */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">KEEP (What Worked)</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {keep.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/60 text-[11px] text-emerald-600 dark:text-emerald-400">
            Anchor habit: {mostConsistentHabit}
          </div>
        </div>

        {/* IMPROVE */}
        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">IMPROVE (Resistance)</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {improve.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/60 text-[11px] text-amber-600 dark:text-amber-400">
            Friction point: {mostMissedHabit}
          </div>
        </div>

        {/* NEXT WEEK */}
        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">NEXT WEEK (Adjustments)</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {nextWeekSuggestions.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200/60 dark:border-blue-900/60 text-[11px] text-blue-600 dark:text-blue-400">
            Suggested plan for upcoming 7 days
          </div>
        </div>
      </div>

      {/* User Notes & Finalize Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Personal Weekly Summary &amp; Commitments
        </label>
        <textarea
          rows="3"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="What is your biggest personal takeaway from this week's data?"
          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="flex items-center justify-end">
          <Button
            variant="primary"
            size="md"
            icon={Save}
            isLoading={saving}
            onClick={handleSaveReview}
          >
            Archive &amp; Finalize Weekly Review
          </Button>
        </div>
      </div>
    </div>
  );
};
