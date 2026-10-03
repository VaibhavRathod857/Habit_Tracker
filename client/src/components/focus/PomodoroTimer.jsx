import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { triggerMajorConfetti } from '../common/ConfettiCelebration.js';

const TIMER_MODES = [
  { id: 'pomodoro', name: 'Pomodoro', minutes: 25, icon: Brain },
  { id: 'short_break', name: 'Short Break', minutes: 5, icon: Coffee },
  { id: 'long_break', name: 'Long Break', minutes: 15, icon: Coffee },
  { id: 'custom', name: 'Custom', minutes: 45, icon: Brain },
];

export const PomodoroTimer = ({
  habits = [],
  tasks = [],
  defaultHabitId = null,
  onSessionComplete,
}) => {
  const [activeMode, setActiveMode] = useState('pomodoro');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(defaultHabitId || '');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [distractionCount, setDistractionCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const initialSecondsRef = useRef(25 * 60);

  useEffect(() => {
    if (defaultHabitId) {
      setSelectedHabitId(defaultHabitId);
    }
  }, [defaultHabitId]);

  // Handle mode switches
  const handleModeChange = (mode) => {
    setIsRunning(false);
    setActiveMode(mode.id);
    const mins = mode.id === 'custom' ? customMinutes : mode.minutes;
    setTimeLeftSeconds(mins * 60);
    initialSecondsRef.current = mins * 60;
  };

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && isRunning) {
      setIsRunning(false);
      handleFinishSession();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeftSeconds]);

  // Audio completion chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  };

  const handleFinishSession = async () => {
    setIsRunning(false);
    playChime();
    triggerMajorConfetti();

    const elapsedSeconds = initialSecondsRef.current - timeLeftSeconds;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    if (onSessionComplete) {
      await onSessionComplete({
        durationMinutes: elapsedMinutes,
        type: activeMode,
        linkedHabit: selectedHabitId || null,
        linkedTask: selectedTaskId || null,
        distractionCount,
        notes,
      });
    }

    // Reset distraction and timer
    setDistractionCount(0);
    setNotes('');
    const currentModeObj = TIMER_MODES.find((m) => m.id === activeMode);
    const mins = activeMode === 'custom' ? customMinutes : currentModeObj?.minutes || 25;
    setTimeLeftSeconds(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    const currentModeObj = TIMER_MODES.find((m) => m.id === activeMode);
    const mins = activeMode === 'custom' ? customMinutes : currentModeObj?.minutes || 25;
    setTimeLeftSeconds(mins * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPct =
    initialSecondsRef.current > 0
      ? ((initialSecondsRef.current - timeLeftSeconds) / initialSecondsRef.current) * 100
      : 0;

  return (
    <div className="rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
      {/* Top Mode Selectors */}
      <div className="flex items-center justify-between gap-2 mb-8">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          {TIMER_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Associated Habit & Task Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Associated Discipline / Habit
          </label>
          <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">General Focus (No specific habit)</option>
            {habits.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.target.value} {h.target.unit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Linked Daily Planner Task
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">None</option>
            {tasks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Timer Circular Display */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* SVG Progress Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-brand-600 transition-all duration-500 ease-linear"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPct) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time Center Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-black tracking-tight text-slate-900 dark:text-white">
              {formatTime(timeLeftSeconds)}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
              {isRunning ? 'Focus In Progress' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-8">
          <Button
            variant="ghost"
            size="md"
            icon={RotateCcw}
            onClick={handleReset}
            title="Reset Timer"
          >
            Reset
          </Button>

          <Button
            variant="primary"
            size="lg"
            icon={isRunning ? Pause : Play}
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 shadow-lg shadow-brand-500/25 text-base"
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={CheckCircle2}
            onClick={handleFinishSession}
            title="Complete & Log Session"
          >
            Complete
          </Button>
        </div>
      </div>

      {/* Distraction Logger & Notes Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Distractions caught:</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            {distractionCount}
          </span>
          <button
            onClick={() => setDistractionCount((prev) => prev + 1)}
            className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            +1 Distraction
          </button>
        </div>

        <input
          type="text"
          placeholder="Session intention / notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
    </div>
  );
};
