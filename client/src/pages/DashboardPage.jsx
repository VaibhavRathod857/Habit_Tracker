import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  Target,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService.js';
import { habitService } from '../services/habitService.js';
import { recoveryService } from '../services/recoveryService.js';
import { reflectionService } from '../services/reflectionService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

import { NowNextCard } from '../components/dashboard/NowNextCard.jsx';
import { DisciplineScoreCard } from '../components/dashboard/DisciplineScoreCard.jsx';
import { StreakCard } from '../components/dashboard/StreakCard.jsx';
import { QuickActionsBar } from '../components/dashboard/QuickActionsBar.jsx';
import { BadDayBanner } from '../components/dashboard/BadDayBanner.jsx';
import { RecoveryBanner } from '../components/dashboard/RecoveryBanner.jsx';
import { TodayHabitsList } from '../components/dashboard/TodayHabitsList.jsx';
import { HabitModal } from '../components/habits/HabitModal.jsx';
import { HabitLogModal } from '../components/habits/HabitLogModal.jsx';
import { DailyReflectionModal } from '../components/reflection/DailyReflectionModal.jsx';
import { RecoveryModal } from '../components/dashboard/RecoveryModal.jsx';
import { JarvisDashboardCard } from '../components/dashboard/JarvisDashboardCard.jsx';
import { Button } from '../components/common/Button.jsx';

export const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [selectedHabitForEdit, setSelectedHabitForEdit] = useState(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedHabitForLog, setSelectedHabitForLog] = useState(null);

  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await dashboardService.getDashboardData();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Quick 1-click habit progress logger
  const handleQuickLog = async (habitId, actualValue) => {
    try {
      await habitService.logHabit(habitId, {
        date: dashboardData.today,
        actualValue,
      });
      await loadDashboard();
    } catch (err) {
      toastError(err.message);
    }
  };

  // Detailed habit log submission from modal
  const handleDetailedLog = async (habitId, logData) => {
    try {
      await habitService.logHabit(habitId, {
        date: dashboardData.today,
        ...logData,
      });
      toastSuccess('Progress updated!');
      await loadDashboard();
    } catch (err) {
      toastError(err.message);
    }
  };

  // Create habit
  const handleSaveHabit = async (habitData) => {
    try {
      await habitService.createHabit(habitData);
      toastSuccess('New habit established!');
      await loadDashboard();
    } catch (err) {
      toastError(err.message);
    }
  };

  // Toggle Bad Day mode
  const handleToggleBadDay = async () => {
    try {
      const res = await recoveryService.toggleBadDay();
      toastSuccess(res.message || 'Bad Day mode updated');
      await refreshUser();
      await loadDashboard();
    } catch (err) {
      toastError(err.message);
    }
  };

  // Activate Recovery mode
  const handleActivateRecovery = async (durationDays, targetReductionPct) => {
    try {
      const res = await recoveryService.activateRecovery(durationDays, targetReductionPct);
      toastSuccess(res.message);
      await refreshUser();
      await loadDashboard();
    } catch (err) {
      toastError(err.message);
    }
  };

  // Complete Recovery mode
  const handleCompleteRecovery = async () => {
    try {
      await recoveryService.completeRecovery();
      toastSuccess('Standard targets restored!');
      await refreshUser();
      await loadDashboard();
    } catch (err) {
      toastError(err.message);
    }
  };

  // Save Reflection
  const handleSaveReflection = async (reflectionData) => {
    try {
      await reflectionService.saveReflection({
        date: dashboardData.today,
        ...reflectionData,
      });
      toastSuccess('Daily reflection logged! +15 Momentum Score');
      await loadDashboard();
    } catch (err) {
      toastError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading your Discipline Dashboard...</p>
      </div>
    );
  }

  const {
    greeting,
    today,
    actionPriority,
    streaks,
    disciplineScore,
    todayHabits = [],
    todayTasks = [],
    activeGoals = [],
    recoveryCheck,
  } = dashboardData || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Greeting & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {greeting}, {user?.name?.split(' ')[0] || 'Friend'} 👋
          </h1>
        </div>

        {/* Quick Actions Shortcuts */}
        <QuickActionsBar
          onStartFocus={() => navigate('/focus')}
          onAddHabit={() => {
            setSelectedHabitForEdit(null);
            setIsHabitModalOpen(true);
          }}
          onOpenPlanner={() => navigate('/planner')}
          onOpenReflection={() => setIsReflectionModalOpen(true)}
          onToggleBadDay={handleToggleBadDay}
          onOpenRecovery={() => setIsRecoveryModalOpen(true)}
          badDayActive={user?.badDayMode?.active}
          recoveryActive={user?.recoveryMode?.active}
        />
      </div>

      {/* Bad Day Mode Banner (Conditional) */}
      {user?.badDayMode?.active && (
        <BadDayBanner onDeactivate={handleToggleBadDay} />
      )}

      {/* Recovery Mode Banner (Conditional) */}
      {user?.recoveryMode?.active && (
        <RecoveryBanner
          recoveryMode={user.recoveryMode}
          onComplete={handleCompleteRecovery}
        />
      )}

      {/* Missed Streak Recovery Suggestion (if 2+ missed days detected and not yet in recovery) */}
      {!user?.recoveryMode?.active && recoveryCheck?.needsRecovery && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3">
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <span className="font-bold">Detected {recoveryCheck.missedDaysCount} missed days:</span> It's completely normal to slip. Don't push through overwhelming plans. Try Recovery Mode to restart with 50% targets.
          </div>
          <Button
            variant="recovery"
            size="sm"
            icon={RotateCcw}
            onClick={() => setIsRecoveryModalOpen(true)}
            className="whitespace-nowrap"
          >
            Start Recovery
          </Button>
        </div>
      )}

      {/* JARVIS PROACTIVE AI COACH CARD */}
      <JarvisDashboardCard />

      {/* THE PRIMARY "WHAT SHOULD I DO RIGHT NOW?" CARD */}
      <NowNextCard
        actionPriority={actionPriority}
        onStartFocus={(habitId) => navigate(`/focus?habitId=${habitId || ''}`)}
        onOpenHabitLog={(habitId) => {
          const targetH = todayHabits.find((h) => h._id === habitId) || todayHabits[0];
          if (targetH) {
            setSelectedHabitForLog(targetH);
            setIsLogModalOpen(true);
          }
        }}
        onOpenReflection={() => setIsReflectionModalOpen(true)}
      />

      {/* Momentum & Discipline Score Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DisciplineScoreCard scoreData={disciplineScore} />
        <StreakCard streaks={streaks} />
      </div>

      {/* Today's Habit List & Daily Planner Task Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Habits */}
        <div className="lg:col-span-2 space-y-4">
          <TodayHabitsList
            habits={todayHabits}
            onLogProgress={handleQuickLog}
            onOpenLogModal={(h) => {
              setSelectedHabitForLog(h);
              setIsLogModalOpen(true);
            }}
            onStartFocus={(habitId) => navigate(`/focus?habitId=${habitId}`)}
            onAddHabit={() => {
              setSelectedHabitForEdit(null);
              setIsHabitModalOpen(true);
            }}
          />
        </div>

        {/* Right 1 Col: Planner & Goals snapshot */}
        <div className="space-y-4">
          {/* Today Tasks Mini Card */}
          <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today's Schedule
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/planner')}
                className="text-brand-600 dark:text-brand-400 -mr-2"
              >
                Open Planner →
              </Button>
            </div>

            {todayTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No tasks planned for today. Time-block your day to stay on track.
              </p>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task._id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          task.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span
                        className={`truncate font-medium ${
                          task.isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.scheduledTime && (
                      <span className="font-mono text-[11px] text-slate-400 ml-2">
                        {task.scheduledTime}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Goals Snapshot */}
          <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Anchor Goals
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/goals')}
                className="text-brand-600 dark:text-brand-400 -mr-2"
              >
                View All →
              </Button>
            </div>

            {activeGoals.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No active goals. Set long-term milestones to drive your habits.
              </p>
            ) : (
              <div className="space-y-3">
                {activeGoals.map((g) => (
                  <div key={g._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200 truncate">{g.title}</span>
                      <span className="text-brand-600 dark:text-brand-400">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
        habit={selectedHabitForEdit}
      />

      <HabitLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        habit={selectedHabitForLog}
        onSaveLog={handleDetailedLog}
      />

      <DailyReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
        onSave={handleSaveReflection}
      />

      <RecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onActivate={handleActivateRecovery}
      />
    </div>
  );
};
