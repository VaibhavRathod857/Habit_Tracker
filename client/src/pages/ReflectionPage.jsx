import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, AlertCircle, History, Check } from 'lucide-react';
import { reflectionService } from '../services/reflectionService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { triggerSubtleConfetti } from '../components/common/ConfettiCelebration.js';

const DISTRACTION_OPTIONS = [
  'Social media',
  'YouTube',
  'Gaming',
  'Phone',
  'Friends',
  'Tiredness',
  'Stress',
  'Unexpected work',
  'Other',
];

const MOODS = [
  { label: 'Great 🔥', value: 'great' },
  { label: 'Good 👍', value: 'good' },
  { label: 'Neutral 😐', value: 'neutral' },
  { label: 'Low 🌧️', value: 'low' },
  { label: 'Exhausted 🔋', value: 'exhausted' },
];

export const ReflectionPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [history, setHistory] = useState([]);
  const [wentWell, setWentWell] = useState('');
  const [distractions, setDistractions] = useState([]);
  const [improvements, setImprovements] = useState('');
  const [mood, setMood] = useState('good');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  const loadData = async () => {
    try {
      const [todayRes, histRes] = await Promise.all([
        reflectionService.getToday(today),
        reflectionService.getHistory(30),
      ]);

      if (todayRes.success && todayRes.data) {
        setWentWell(todayRes.data.wentWell || '');
        setDistractions(todayRes.data.distractions || []);
        setImprovements(todayRes.data.improvements || '');
        setMood(todayRes.data.mood || 'good');
        setEnergyLevel(todayRes.data.energyLevel || 3);
      }
      if (histRes.success && histRes.data) {
        setHistory(histRes.data);
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDistraction = (item) => {
    if (distractions.includes(item)) {
      setDistractions(distractions.filter((d) => d !== item));
    } else {
      setDistractions([...distractions, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reflectionService.saveReflection({
        date: today,
        wentWell,
        distractions,
        improvements,
        mood,
        energyLevel: Number(energyLevel),
      });
      triggerSubtleConfetti();
      toastSuccess('Daily reflection logged (+15 Discipline Score)!');
      await loadData();
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Daily Reflection &amp; Evening Review
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Close each day's feedback loop. Understanding why you succeeded or got distracted is the key to effortless discipline.
        </p>
      </div>

      {/* Today's Reflection Form Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Evening Reflection ({today})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reflect with curiosity, never shame.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Went Well */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              1. What went well today? (Celebrate your execution)
            </label>
            <textarea
              rows="2"
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              placeholder="e.g. Cleared 2 DSA problems and protected my afternoon focus block."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Distractions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              2. What distracted you or created friction?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DISTRACTION_OPTIONS.map((item) => {
                const selected = distractions.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDistraction(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              3. What could you adjust or improve tomorrow?
            </label>
            <textarea
              rows="2"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="e.g. Keep phone in desk drawer until 11:30 AM."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Mood & Energy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                General State of Mind
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`p-2 rounded-xl text-xs font-medium text-center border transition-all ${
                      mood === m.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Energy Level: {energyLevel} / 5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Depleted (1)</span>
                <span>Peak (5)</span>
              </div>
            </div>
          </div>

          <Button variant="primary" size="md" type="submit" isLoading={loading} className="w-full sm:w-auto">
            Save Daily Reflection
          </Button>
        </form>
      </div>

      {/* Past Reflections Log */}
      <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <History className="w-4 h-4 text-purple-500" /> Reflection History
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No past reflections recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((r) => (
              <div
                key={r._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="font-mono text-slate-800 dark:text-slate-200">{r.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Mood: {r.mood}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-600">
                      Energy: {r.energyLevel}/5
                    </span>
                  </div>
                </div>

                {r.wentWell && (
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-emerald-600">Win: </span>
                    {r.wentWell}
                  </p>
                )}

                {r.distractions?.length > 0 && (
                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-rose-500">Distractions: </span>
                    {r.distractions.join(', ')}
                  </p>
                )}

                {r.improvements && (
                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-blue-500">Adjustment: </span>
                    {r.improvements}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
