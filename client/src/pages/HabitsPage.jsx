import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Flame,
  Pause,
  Play,
  Edit2,
  Trash2,
  Sliders,
  Filter,
} from 'lucide-react';
import { habitService } from '../services/habitService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { HabitModal } from '../components/habits/HabitModal.jsx';
import { HabitLogModal } from '../components/habits/HabitLogModal.jsx';
import { HabitAdaptationAlert } from '../components/habits/HabitAdaptationAlert.jsx';

const CATEGORIES = [
  'All',
  'Study',
  'Fitness',
  'Career',
  'Health',
  'Mental wellbeing',
  'Reading',
  'Sleep',
  'Personal development',
];

export const HabitsPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [selectedHabitForEdit, setSelectedHabitForEdit] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedHabitForLog, setSelectedHabitForLog] = useState(null);

  const fetchHabits = async () => {
    try {
      const res = await habitService.getHabits({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      if (res.success && res.data) {
        setHabits(res.data);
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [selectedCategory, searchQuery]);

  const handleSaveHabit = async (habitData) => {
    try {
      if (selectedHabitForEdit) {
        await habitService.updateHabit(selectedHabitForEdit._id, habitData);
        toastSuccess('Habit updated successfully');
      } else {
        await habitService.createHabit(habitData);
        toastSuccess('Habit created successfully');
      }
      await fetchHabits();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleTogglePause = async (id) => {
    try {
      const res = await habitService.togglePause(id);
      toastSuccess(res.message);
      await fetchHabits();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this habit?')) return;
    try {
      await habitService.deleteHabit(id, true);
      toastSuccess('Habit removed');
      await fetchHabits();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleAcceptAdaptation = async (habitId) => {
    try {
      const res = await habitService.acceptAdaptation(habitId);
      toastSuccess(res.message);
      await fetchHabits();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleDismissAdaptation = async (habitId) => {
    try {
      await habitService.dismissAdaptation(habitId);
      toastSuccess('Suggestion dismissed');
      await fetchHabits();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSaveLog = async (habitId, logData) => {
    try {
      await habitService.logHabit(habitId, {
        date: new Date().toISOString().slice(0, 10),
        ...logData,
      });
      toastSuccess('Progress recorded!');
      await fetchHabits();
    } catch (err) {
      toastError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build, calibrate, and track your daily discipline routines.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            setSelectedHabitForEdit(null);
            setIsHabitModalOpen(true);
          }}
        >
          Create Discipline
        </Button>
      </div>

      {/* Adaptive Suggestions Banner */}
      {habits
        .filter((h) => h.adaptationSuggestion?.status === 'pending')
        .map((h) => (
          <HabitAdaptationAlert
            key={h._id}
            habit={h}
            onAccept={handleAcceptAdaptation}
            onDismiss={handleDismissAdaptation}
          />
        ))}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Habit Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading disciplines...</div>
      ) : habits.length === 0 ? (
        <div className="rounded-3xl p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No habits found in this view.
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Create your first discipline to begin building momentum.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setSelectedHabitForEdit(null);
              setIsHabitModalOpen(true);
            }}
          >
            Create New Habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <div
              key={habit._id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                habit.isPaused
                  ? 'border-slate-200/60 dark:border-slate-800/60 opacity-60'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div>
                {/* Category & Status Badges */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {habit.category}
                  </span>

                  <div className="flex items-center gap-1">
                    {habit.isMinimumViable && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                        Minimum Viable
                      </span>
                    )}

                    {habit.currentStreak > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                        <Flame className="w-3.5 h-3.5" />
                        {habit.currentStreak}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Habit Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {habit.name}
                </h3>

                {habit.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {habit.description}
                  </p>
                )}

                {habit.whyReason && (
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">WHY: </span>
                    {habit.whyReason}
                  </div>
                )}
              </div>

              {/* Bottom Target & Options Bar */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 font-medium">Target: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {habit.target?.value} {habit.target?.unit}
                  </span>
                  <span className="text-slate-400 ml-1">({habit.frequency?.type})</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedHabitForLog(habit);
                      setIsLogModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Log Progress"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleTogglePause(habit._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={habit.isPaused ? 'Resume Habit' : 'Pause Habit'}
                  >
                    {habit.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedHabitForEdit(habit);
                      setIsHabitModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Habit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(habit._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
        onSaveLog={handleSaveLog}
      />
    </div>
  );
};
