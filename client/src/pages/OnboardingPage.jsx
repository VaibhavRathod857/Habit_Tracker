import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Clock,
  Bell,
  Layers,
} from 'lucide-react';
import { authService } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';

const LIFE_AREAS = [
  'Career',
  'Study',
  'Fitness',
  'Health',
  'Mental wellbeing',
  'Reading',
  'Finance',
  'Relationships',
  'Personal development',
  'Sleep',
  'Other',
];

const SUGGESTED_HABITS = [
  'DSA Practice (60m)',
  'Morning Workout (30m)',
  'Read Non-Fiction (15 pages)',
  'Mindfulness Meditation (10m)',
  'Drink 3L Water',
  'Digital Curfew Before Bed',
];

export const OnboardingPage = () => {
  const { refreshUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedLifeAreas, setSelectedLifeAreas] = useState([
    'Study',
    'Fitness',
    'Career',
    'Mental wellbeing',
  ]);
  const [mainGoal, setMainGoal] = useState('');
  const [selectedHabits, setSelectedHabits] = useState(['DSA Practice (60m)', 'Morning Workout (30m)']);
  const [customHabit, setCustomHabit] = useState('');
  const [habitsToReduce, setHabitsToReduce] = useState('');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [productivityHours, setProductivityHours] = useState('morning');
  const [notificationLevel, setNotificationLevel] = useState('normal');

  const toggleLifeArea = (area) => {
    if (selectedLifeAreas.includes(area)) {
      setSelectedLifeAreas(selectedLifeAreas.filter((a) => a !== area));
    } else {
      setSelectedLifeAreas([...selectedLifeAreas, area]);
    }
  };

  const toggleHabit = (h) => {
    if (selectedHabits.includes(h)) {
      setSelectedHabits(selectedHabits.filter((item) => item !== h));
    } else {
      setSelectedHabits([...selectedHabits, h]);
    }
  };

  const addCustomHabit = () => {
    if (!customHabit.trim()) return;
    if (!selectedHabits.includes(customHabit.trim())) {
      setSelectedHabits([...selectedHabits, customHabit.trim()]);
    }
    setCustomHabit('');
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await authService.completeOnboarding({
        lifeAreas: selectedLifeAreas,
        mainGoals: mainGoal ? [mainGoal] : [],
        buildHabits: selectedHabits,
        wakeTime,
        sleepTime,
        productivityHours,
        notificationPreference: notificationLevel,
      });
      await refreshUser();
      toastSuccess('Your DisciplineOS is primed and ready!');
      navigate('/dashboard');
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await authService.completeOnboarding({});
      await refreshUser();
      navigate('/dashboard');
    } catch (e) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b16] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Top Header with step indicators */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Personalizing DisciplineOS • Step {step} of 4
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {step === 1 && 'What areas of life do you want to elevate?'}
              {step === 2 && 'Define your main anchor goal & habits'}
              {step === 3 && 'Habits to reduce & biological rhythm'}
              {step === 4 && 'Pacing & Notification Cadence'}
            </h1>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            Skip for now →
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-brand-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Box */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* STEP 1: Life Areas */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select the core domains you want to bring intentionality and focus to:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {LIFE_AREAS.map((area) => {
                  const isSelected = selectedLifeAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleLifeArea(area)}
                      className={`p-3 rounded-2xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{area}</span>
                      {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Main Goal & Build Habits */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1. What is your #1 primary goal for the next 90 days?
                </label>
                <input
                  type="text"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  placeholder="e.g. Become placement ready & crack tech interviews"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  2. Select or create the core habits you want to build:
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUGGESTED_HABITS.map((h) => {
                    const isSelected = selectedHabits.includes(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleHabit(h)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom habit..."
                    value={customHabit}
                    onChange={(e) => setCustomHabit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomHabit();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Button variant="secondary" size="sm" onClick={addCustomHabit}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Habits to Reduce & Sleep Rhythm */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What habits or distractions do you want to reduce?
                </label>
                <input
                  type="text"
                  value={habitsToReduce}
                  onChange={(e) => setHabitsToReduce(e.target.value)}
                  placeholder="e.g. Doomscrolling Instagram before bed, YouTube rabbit holes"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Wake-up Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Sleep Time
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Peak Productivity Hours
                </label>
                <select
                  value={productivityHours}
                  onChange={(e) => setProductivityHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="morning">Morning (Early clarity, 07:00 - 12:00)</option>
                  <option value="afternoon">Afternoon (13:00 - 17:00)</option>
                  <option value="evening">Evening / Night Owl (18:00 - 23:00)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Notifications */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your reminder style. We believe in gentle nudges rather than notification spam.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { level: 'minimal', title: 'Minimal', desc: 'Only critical reminders & reviews' },
                  { level: 'normal', title: 'Normal (Recommended)', desc: 'Daily habit & reflection prompts' },
                  { level: 'frequent', title: 'Frequent', desc: 'More frequent check-ins' },
                  { level: 'off', title: 'Off', desc: 'No reminders; completely silent' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setNotificationLevel(item.level)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      notificationLevel === item.level
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.title}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="md"
                icon={ArrowLeft}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                onClick={() => setStep(step + 1)}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={Sparkles}
                isLoading={loading}
                onClick={handleFinish}
              >
                Complete Setup & Launch
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
