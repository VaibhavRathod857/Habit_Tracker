import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { CheckCircle2, XCircle, Timer, Calendar, BookOpen, AlertCircle } from 'lucide-react';

export const DayDetailModal = ({ isOpen, onClose, dayDetails }) => {
  if (!dayDetails) return null;

  const {
    date,
    completedHabits = [],
    partialHabits = [],
    missedHabits = [],
    tasks = [],
    focusSessions = [],
    totalFocusMinutes = 0,
    reflection = null,
  } = dayDetails;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Day Inspection: ${date}`}
      subtitle="Complete breakdown of actions, focus, and reflections recorded on this date."
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Quick summary stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
              {completedHabits.length}
            </span>
            <p className="text-[10px] uppercase font-bold text-slate-500">Completed</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
            <span className="text-lg font-black text-rose-700 dark:text-rose-400">
              {missedHabits.length}
            </span>
            <p className="text-[10px] uppercase font-bold text-slate-500">Missed</p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
            <span className="text-lg font-black text-blue-700 dark:text-blue-400">
              {totalFocusMinutes}m
            </span>
            <p className="text-[10px] uppercase font-bold text-slate-500">Focus Time</p>
          </div>
        </div>

        {/* Completed Habits */}
        {completedHabits.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed Disciplines
            </h4>
            <div className="space-y-1.5">
              {completedHabits.map(({ habit, log }) => (
                <div
                  key={habit._id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {habit.name}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {log.actualValue} / {log.targetValue} {habit.target?.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partial Completions */}
        {partialHabits.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Partial Progress
            </h4>
            <div className="space-y-1.5">
              {partialHabits.map(({ habit, log }) => (
                <div
                  key={habit._id}
                  className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {habit.name}
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {log.actualValue} / {log.targetValue} {habit.target?.unit} ({log.completionRate}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missed Habits */}
        {missedHabits.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-slate-400" /> Missed / Rest Days
            </h4>
            <div className="space-y-1.5">
              {missedHabits.map(({ habit }) => (
                <div
                  key={habit._id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500"
                >
                  <span>{habit.name}</span>
                  <span>Target: {habit.target?.value} {habit.target?.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Reflection */}
        {reflection && (
          <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Reflection ({reflection.mood || 'neutral'})
            </h4>
            {reflection.wentWell && (
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                <span className="font-semibold">Went well:</span> {reflection.wentWell}
              </p>
            )}
            {reflection.distractions?.length > 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                <span className="font-semibold">Distractions:</span> {reflection.distractions.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
