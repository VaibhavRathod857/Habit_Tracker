import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { isHabitScheduledOnDate } from './streakService.js';
import { getTodayString } from '../utils/dateHelpers.js';

export const calculateDisciplineScore = async (userId, targetDate = getTodayString()) => {
  // 1. Habit Completion (Max 40 pts)
  const habits = await Habit.find({ user: userId, isArchived: false, isPaused: false });
  const scheduledHabits = habits.filter((h) => isHabitScheduledOnDate(h, targetDate));
  const logs = await HabitLog.find({ user: userId, date: targetDate });

  let habitScore = 0;
  let habitsCompleted = 0;
  const totalScheduled = scheduledHabits.length;

  if (totalScheduled > 0) {
    const completedLogMap = new Set(
      logs.filter((l) => l.isCompleted).map((l) => l.habit.toString())
    );
    for (const h of scheduledHabits) {
      if (completedLogMap.has(h._id.toString())) {
        habitsCompleted++;
      }
    }
    habitScore = Math.round((habitsCompleted / totalScheduled) * 40);
  } else {
    habitScore = 40; // No habits due, full credit
  }

  // 2. Focus Time (Max 25 pts - 1 pt per 2 mins up to 50 min)
  const focusSessions = await FocusSession.find({ user: userId, date: targetDate });
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const focusScore = Math.min(25, Math.round(totalFocusMinutes * 0.5));

  // 3. Planned Tasks (Max 20 pts)
  const tasks = await Task.find({ user: userId, date: targetDate });
  let taskScore = 0;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;

  if (totalTasks > 0) {
    taskScore = Math.round((completedTasks / totalTasks) * 20);
  } else {
    taskScore = 15; // Baseline if no tasks scheduled
  }

  // 4. Daily Reflection (15 pts)
  const reflection = await DailyReflection.findOne({ user: userId, date: targetDate });
  const reflectionScore = reflection ? 15 : 0;

  const totalScore = Math.min(100, habitScore + focusScore + taskScore + reflectionScore);

  return {
    totalScore,
    maxScore: 100,
    breakdown: {
      habits: {
        score: habitScore,
        max: 40,
        completed: habitsCompleted,
        total: totalScheduled,
      },
      focus: {
        score: focusScore,
        max: 25,
        minutes: totalFocusMinutes,
      },
      tasks: {
        score: taskScore,
        max: 20,
        completed: completedTasks,
        total: totalTasks,
      },
      reflection: {
        score: reflectionScore,
        max: 15,
        logged: Boolean(reflection),
      },
    },
    message:
      totalScore >= 80
        ? 'Excellent daily execution and momentum.'
        : totalScore >= 50
        ? 'Solid steady progress. Keep building the foundation.'
        : 'Every small action counts. A single win restores momentum.',
  };
};
