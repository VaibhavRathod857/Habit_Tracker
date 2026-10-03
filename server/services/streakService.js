import { HabitLog } from '../models/HabitLog.js';
import { Habit } from '../models/Habit.js';
import { getTodayString, getDaysAgoString, getDayOfWeekIndex } from '../utils/dateHelpers.js';

export const isHabitScheduledOnDate = (habit, dateStr) => {
  const dayOfWeek = getDayOfWeekIndex(dateStr); // 0 = Sun, 6 = Sat
  const freq = habit.frequency || { type: 'daily' };

  if (freq.type === 'daily') return true;
  if (freq.type === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (freq.type === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
  if (freq.type === 'specific_days') {
    return Array.isArray(freq.daysOfWeek) && freq.daysOfWeek.includes(dayOfWeek);
  }
  return true;
};

/**
 * Calculates current streak, best streak, and consistency percentage for a habit
 */
export const recalculateHabitStreaks = async (habitId, userId) => {
  const habit = await Habit.findById(habitId);
  if (!habit) return null;

  // Retrieve logs sorted descending by date
  const logs = await HabitLog.find({ habit: habitId, user: userId })
    .sort({ date: -1 })
    .lean();

  const logMap = new Map();
  for (const log of logs) {
    logMap.set(log.date, log);
  }

  const today = getTodayString();
  let currentStreak = 0;
  let bestStreak = habit.bestStreak || 0;
  let totalCompletions = 0;
  let totalScheduled = 0;

  // Check last 60 days for streak and consistency
  let streakBroken = false;
  let checkDateOffset = 0;

  // Check today first
  const todayLog = logMap.get(today);
  const scheduledToday = isHabitScheduledOnDate(habit, today);
  if (todayLog && todayLog.isCompleted) {
    currentStreak++;
    totalCompletions++;
    checkDateOffset = 1;
  } else {
    // If today is not completed yet, streak is not broken unless yesterday was missed
    checkDateOffset = 1;
  }

  // Walk backwards up to 90 days
  for (let i = checkDateOffset; i < 90; i++) {
    const dateStr = getDaysAgoString(i);
    const scheduled = isHabitScheduledOnDate(habit, dateStr);
    if (!scheduled) continue;

    totalScheduled++;
    const log = logMap.get(dateStr);

    if (log && log.isCompleted) {
      totalCompletions++;
      if (!streakBroken) {
        currentStreak++;
      }
    } else {
      if (!streakBroken) {
        streakBroken = true;
      }
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  // Check for Habit Adaptation Opportunity:
  // If user has attempted for at least 7 scheduled days and completion rate < 45%
  let adaptation = habit.adaptationSuggestion;
  if (totalScheduled >= 7) {
    const rate = (totalCompletions / totalScheduled) * 100;
    if (rate < 45 && habit.target.value > 5 && (!adaptation || adaptation.status !== 'accepted')) {
      const suggestedVal = Math.max(1, Math.round(habit.target.value * 0.5));
      adaptation = {
        suggestedTarget: suggestedVal,
        reason: `Your completion rate over recent days is ${Math.round(rate)}%. Reducing to ${suggestedVal} ${habit.target.unit} can help you rebuild consistency without friction.`,
        status: 'pending',
        suggestedAt: new Date(),
      };
    }
  }

  habit.currentStreak = currentStreak;
  habit.bestStreak = bestStreak;
  habit.totalCompletions = totalCompletions;
  if (adaptation) habit.adaptationSuggestion = adaptation;

  await habit.save();

  return {
    currentStreak,
    bestStreak,
    totalCompletions,
    totalScheduled,
    consistencyRate: totalScheduled > 0 ? Math.round((totalCompletions / totalScheduled) * 100) : 100,
  };
};

/**
 * Checks overall user consistency and returns whether Recovery Mode is recommended
 */
export const checkUserMissedStreak = async (userId) => {
  const habits = await Habit.find({ user: userId, isArchived: false, isPaused: false });
  if (habits.length === 0) return { needsRecovery: false, missedDaysCount: 0 };

  const last3Days = [getDaysAgoString(1), getDaysAgoString(2), getDaysAgoString(3)];
  let consecutiveZeroDays = 0;

  for (const dateStr of last3Days) {
    const logs = await HabitLog.find({ user: userId, date: dateStr, isCompleted: true });
    if (logs.length === 0) {
      consecutiveZeroDays++;
    } else {
      break;
    }
  }

  return {
    needsRecovery: consecutiveZeroDays >= 2,
    missedDaysCount: consecutiveZeroDays,
  };
};
