import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { rulesService } from '../services/rulesService.js';
import { habitService } from '../services/habitService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';

export const RulesAndStacksPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [rules, setRules] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleText, setRuleText] = useState('');
  const [ruleCategory, setRuleCategory] = useState('Focus');

  const [isStackModalOpen, setIsStackModalOpen] = useState(false);
  const [cue, setCue] = useState('');
  const [routineHabitId, setRoutineHabitId] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('morning');

  const loadData = async () => {
    try {
      const [rRes, sRes, hRes] = await Promise.all([
        rulesService.getRules(),
        rulesService.getStacks(),
        habitService.getHabits({}),
      ]);
      if (rRes.success) setRules(rRes.data);
      if (sRes.success) setStacks(sRes.data);
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

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!ruleText.trim()) return;
    try {
      await rulesService.createRule({
        ruleText: ruleText.trim(),
        category: ruleCategory,
      });
      toastSuccess('Personal rule established');
      setRuleText('');
      setIsRuleModalOpen(false);
      await loadData();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await rulesService.deleteRule(id);
      toastSuccess('Rule removed');
      await loadData();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleCreateStack = async (e) => {
    e.preventDefault();
    if (!cue.trim()) return;

    const selectedHabit = habits.find((h) => h._id === routineHabitId);
    const routineHabitName = selectedHabit ? selectedHabit.name : 'Routine Habit';

    try {
      await rulesService.createStack({
        cue: cue.trim(),
        routineHabit: routineHabitId || null,
        routineHabitName,
        timeOfDay,
      });
      toastSuccess('Habit stack established');
      setCue('');
      setRoutineHabitId('');
      setIsStackModalOpen(false);
      await loadData();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleDeleteStack = async (id) => {
    try {
      await rulesService.deleteStack(id);
      toastSuccess('Stack removed');
      await loadData();
    } catch (err) {
      toastError(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Personal Rules &amp; Habit Stacking
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pair behaviors with environmental triggers and guardrails to eliminate decision fatigue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Rules Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Rules
              </h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setIsRuleModalOpen(true)}
            >
              Add Rule
            </Button>
          </div>

          <div className="space-y-2.5">
            {rules.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No personal rules defined yet.
              </p>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule._id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-1.5 inline-block">
                      {rule.category}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      "{rule.ruleText}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Habit Stacks Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Habit Stacks ("After X → Do Y")
              </h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setIsStackModalOpen(true)}
            >
              Add Stack
            </Button>
          </div>

          <div className="space-y-2.5">
            {stacks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No habit stacks created yet.
              </p>
            ) : (
              stacks.map((stack) => (
                <div
                  key={stack._id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {stack.timeOfDay} Stack
                    </span>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {stack.cue}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
                      <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-bold">
                        {stack.routineHabitName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStack(stack._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Rule Modal */}
      <Modal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title="Add Personal Rule"
        subtitle="Uncompromising guardrails for your energy and focus."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rule Principle *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Never miss twice; No phone during morning study"
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={ruleCategory}
              onChange={(e) => setRuleCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Focus">Focus &amp; Deep Work</option>
              <option value="Digital Wellbeing">Digital Wellbeing</option>
              <option value="Sleep">Sleep Architecture</option>
              <option value="Health">Physical Health</option>
              <option value="Mindset">Mindset &amp; Philosophy</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Stack Modal */}
      <Modal
        isOpen={isStackModalOpen}
        onClose={() => setIsStackModalOpen(false)}
        title="Create Habit Stack"
        subtitle="Attach a new routine immediately after an established behavioral cue."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateStack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              After (Trigger Cue) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. After pouring my morning coffee..."
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              I will execute (Habit) *
            </label>
            <select
              required
              value={routineHabitId}
              onChange={(e) => setRoutineHabitId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select a habit...</option>
              {habits.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time of Day
            </label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={() => setIsStackModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Habit Stack
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
