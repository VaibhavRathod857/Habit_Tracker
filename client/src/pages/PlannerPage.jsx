import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { taskService } from '../services/taskService.js';
import { habitService } from '../services/habitService.js';
import { goalService } from '../services/goalService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { TaskModal } from '../components/planner/TaskModal.jsx';
import { triggerSubtleConfetti } from '../components/common/ConfettiCelebration.js';

export const PlannerPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  const fetchTasksAndContext = async () => {
    try {
      const [taskRes, habitRes, goalRes] = await Promise.all([
        taskService.getTasks(currentDate),
        habitService.getHabits({}),
        goalService.getGoals({}),
      ]);
      if (taskRes.success) setTasks(taskRes.data);
      if (habitRes.success) setHabits(habitRes.data);
      if (goalRes.success) setGoals(goalRes.data);
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndContext();
  }, [currentDate]);

  const handleToggleComplete = async (taskId) => {
    try {
      const res = await taskService.toggleComplete(taskId);
      if (res.data?.isCompleted) {
        triggerSubtleConfetti();
      }
      await fetchTasksAndContext();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTaskForEdit) {
        await taskService.updateTask(selectedTaskForEdit._id, taskData);
        toastSuccess('Task updated');
      } else {
        await taskService.createTask(taskData);
        toastSuccess('Task added to schedule');
      }
      await fetchTasksAndContext();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      toastSuccess('Task deleted');
      await fetchTasksAndContext();
    } catch (err) {
      toastError(err.message);
    }
  };

  const changeDateBy = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const isToday = currentDate === new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Time-block your day to eliminate distraction and mental resistance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Picker controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold px-2 text-slate-800 dark:text-slate-200 font-mono">
              {currentDate} {isToday && '(Today)'}
            </span>

            <button
              onClick={() => changeDateBy(1)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setSelectedTaskForEdit(null);
              setIsTaskModalOpen(true);
            }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400">Scheduled Execution:</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-2">
            {completedCount} of {tasks.length} tasks completed
          </span>
        </div>

        <div className="w-36 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{
              width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading daily schedule...</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-3xl p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No tasks scheduled for {currentDate}.
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Plan out your day in advance to execute with effortless momentum.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setSelectedTaskForEdit(null);
              setIsTaskModalOpen(true);
            }}
          >
            Schedule First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                task.isCompleted
                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleComplete(task._id)}
                  className={`flex-shrink-0 transition-transform active:scale-90 ${
                    task.isCompleted
                      ? 'text-emerald-500'
                      : 'text-slate-300 dark:text-slate-600 hover:text-brand-500'
                  }`}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold truncate ${
                        task.isCompleted
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        task.priority === 'high'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {task.linkedHabit && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-600 font-medium">
                        Linked: {task.linkedHabit.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    {task.scheduledTime && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {task.scheduledTime}
                      </span>
                    )}
                    <span>{task.estimatedDurationMinutes} mins</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedTaskForEdit(task);
                    setIsTaskModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={selectedTaskForEdit}
        habits={habits}
        goals={goals}
        currentDate={currentDate}
      />
    </div>
  );
};
