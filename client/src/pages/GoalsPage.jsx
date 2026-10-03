import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import { goalService } from '../services/goalService.js';
import { habitService } from '../services/habitService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { GoalModal } from '../components/goals/GoalModal.jsx';
import { triggerSubtleConfetti } from '../components/common/ConfettiCelebration.js';

export const GoalsPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState(null);

  const loadData = async () => {
    try {
      const [gRes, hRes] = await Promise.all([
        goalService.getGoals(),
        habitService.getHabits({}),
      ]);
      if (gRes.success) setGoals(gRes.data);
      if (hRes.success) setHabits(hRes.data);
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      const res = await goalService.toggleMilestone(goalId, milestoneId);
      if (res.success) {
        triggerSubtleConfetti();
        await loadData();
      }
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSaveGoal = async (goalData) => {
    try {
      if (selectedGoalForEdit) {
        await goalService.updateGoal(selectedGoalForEdit._id, goalData);
        toastSuccess('Goal updated');
      } else {
        await goalService.createGoal(goalData);
        toastSuccess('Goal created');
      }
      await loadData();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to remove this goal?')) return;
    try {
      await goalService.deleteGoal(id);
      toastSuccess('Goal deleted');
      await loadData();
    } catch (err) {
      toastError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Long-Term Goals &amp; Milestones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect daily atomic actions to overarching life achievements.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            setSelectedGoalForEdit(null);
            setIsGoalModalOpen(true);
          }}
        >
          Define Goal
        </Button>
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="rounded-3xl p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No goals created yet.
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Anchor your daily habits into clear outcomes to maintain perspective.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setSelectedGoalForEdit(null);
              setIsGoalModalOpen(true);
            }}
          >
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div
              key={goal._id}
              className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {goal.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        goal.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                          : 'bg-brand-50 dark:bg-brand-950 text-brand-600'
                      }`}
                    >
                      {goal.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedGoalForEdit(goal);
                        setIsGoalModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4 mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Linked Habits */}
                {goal.linkedHabits?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Driving Habits
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {goal.linkedHabits.map((h) => (
                        <span
                          key={h._id || h}
                          className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {h.name || 'Habit'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones Checklist */}
                {goal.milestones?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Milestones
                    </h4>
                    <div className="space-y-1.5">
                      {goal.milestones.map((m) => (
                        <div
                          key={m._id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                        >
                          <button
                            onClick={() => handleToggleMilestone(goal._id, m._id)}
                            className={m.isCompleted ? 'text-emerald-500' : 'text-slate-400'}
                          >
                            {m.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={
                              m.isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }
                          >
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Deadline */}
              {goal.deadline && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        goal={selectedGoalForEdit}
        habits={habits}
      />
    </div>
  );
};
