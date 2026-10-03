import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { FocusSession } from '../models/FocusSession.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { Task } from '../models/Task.js';
import { Goal } from '../models/Goal.js';
import { getTodayString, getDaysAgoString, getDateRange } from '../utils/dateHelpers.js';
import { isHabitScheduledOnDate } from '../services/streakService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { range = '30d' } = req.query;

    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const numDays = daysMap[range] || 30;

    const startDate = getDaysAgoString(numDays);
    const today = getTodayString();
    const dateList = getDateRange(startDate, today);

    const habits = await Habit.find({ user: userId, isArchived: false }).lean();
    const logs = await HabitLog.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
    }).lean();
    const focusSessions = await FocusSession.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
    }).lean();
    const reflections = await DailyReflection.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
    }).lean();

    // Group logs by date
    const dateLogMap = new Map();
    logs.forEach((l) => {
      if (!dateLogMap.has(l.date)) dateLogMap.set(l.date, []);
      dateLogMap.get(l.date).push(l);
    });

    // Group focus by date
    const dateFocusMap = new Map();
    focusSessions.forEach((s) => {
      const current = dateFocusMap.get(s.date) || 0;
      dateFocusMap.set(s.date, current + (s.durationMinutes || 0));
    });

    // 1. Daily trend series for charts
    const dailyTrends = dateList.map((d) => {
      const dayLogs = dateLogMap.get(d) || [];
      const completed = dayLogs.filter((l) => l.isCompleted).length;
      // Scheduled habits for this date
      const scheduledCount = habits.filter((h) => isHabitScheduledOnDate(h, d)).length;
      const rate = scheduledCount > 0 ? Math.min(100, Math.round((completed / scheduledCount) * 100)) : 0;
      const focusMins = dateFocusMap.get(d) || 0;

      return {
        date: d,
        displayDate: d.slice(5), // "MM-DD"
        completionRate: rate,
        completedCount: completed,
        scheduledCount,
        focusMinutes: focusMins,
      };
    });

    // 2. Habit consistency ranking
    const habitStats = habits.map((h) => {
      const hLogs = logs.filter((l) => l.habit.toString() === h._id.toString());
      const completedCount = hLogs.filter((l) => l.isCompleted).length;
      const scheduledCount = dateList.filter((d) => isHabitScheduledOnDate(h, d)).length;
      const consistency = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

      return {
        id: h._id,
        name: h.name,
        category: h.category,
        color: h.color,
        icon: h.icon,
        target: h.target,
        completedCount,
        scheduledCount,
        consistency,
        currentStreak: h.currentStreak,
        bestStreak: h.bestStreak,
      };
    }).sort((a, b) => b.consistency - a.consistency);

    // 3. Life Areas balance
    const categoryTotals = {};
    habits.forEach((h) => {
      categoryTotals[h.category] = (categoryTotals[h.category] || 0);
    });
    logs.filter((l) => l.isCompleted).forEach((l) => {
      const h = habits.find((item) => item._id.toString() === l.habit.toString());
      if (h) {
        categoryTotals[h.category] = (categoryTotals[h.category] || 0) + 1;
      }
    });

    const lifeAreaBalance = Object.entries(categoryTotals).map(([area, completions]) => ({
      area,
      completions,
    }));

    // 4. Distraction patterns
    const distractionTally = {};
    reflections.forEach((r) => {
      (r.distractions || []).forEach((d) => {
        distractionTally[d] = (distractionTally[d] || 0) + 1;
      });
    });

    const distractionsList = Object.entries(distractionTally)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 5. Total focus metrics
    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const avgFocusPerSession = focusSessions.length > 0 ? Math.round(totalFocusMinutes / focusSessions.length) : 0;

    return sendSuccess(res, {
      range,
      numDays,
      dailyTrends,
      habitStats,
      lifeAreaBalance,
      distractionsList,
      metrics: {
        totalFocusMinutes,
        avgFocusPerSession,
        totalFocusSessions: focusSessions.length,
        totalHabitCompletions: logs.filter((l) => l.isCompleted).length,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getHeatmapData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const startDate = getDaysAgoString(365);
    const today = getTodayString();
    const allDates = getDateRange(startDate, today);

    const logs = await HabitLog.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
      isCompleted: true,
    }).lean();

    const focusSessions = await FocusSession.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
    }).lean();

    const logCountMap = new Map();
    logs.forEach((l) => {
      logCountMap.set(l.date, (logCountMap.get(l.date) || 0) + 1);
    });

    const focusMap = new Map();
    focusSessions.forEach((s) => {
      focusMap.set(s.date, (focusMap.get(s.date) || 0) + s.durationMinutes);
    });

    const heatmap = allDates.map((dateStr) => {
      const completions = logCountMap.get(dateStr) || 0;
      const focusMinutes = focusMap.get(dateStr) || 0;

      // Intensity level 0 to 4
      let level = 0;
      if (completions >= 4 || focusMinutes >= 60) level = 4;
      else if (completions >= 3 || focusMinutes >= 45) level = 3;
      else if (completions >= 2 || focusMinutes >= 25) level = 2;
      else if (completions >= 1 || focusMinutes > 0) level = 1;

      return {
        date: dateStr,
        count: completions,
        focusMinutes,
        level,
      };
    });

    return sendSuccess(res, heatmap);
  } catch (err) {
    next(err);
  }
};

export const getCalendarDayDetails = async (req, res, next) => {
  try {
    const { date } = req.params;
    const userId = req.user._id;

    const habits = await Habit.find({ user: userId, isArchived: false });
    const logs = await HabitLog.find({ user: userId, date }).populate('habit');
    const tasks = await Task.find({ user: userId, date });
    const focusSessions = await FocusSession.find({ user: userId, date });
    const reflection = await DailyReflection.findOne({ user: userId, date });

    const completedHabits = [];
    const missedHabits = [];
    const partialHabits = [];

    const logMap = new Map();
    logs.forEach((l) => {
      if (l.habit) logMap.set(l.habit._id.toString(), l);
    });

    habits.forEach((h) => {
      if (isHabitScheduledOnDate(h, date)) {
        const log = logMap.get(h._id.toString());
        if (log && log.isCompleted) {
          completedHabits.push({ habit: h, log });
        } else if (log && log.actualValue > 0) {
          partialHabits.push({ habit: h, log });
        } else {
          missedHabits.push({ habit: h, log: log || null });
        }
      }
    });

    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    return sendSuccess(res, {
      date,
      completedHabits,
      partialHabits,
      missedHabits,
      tasks,
      focusSessions,
      totalFocusMinutes,
      reflection,
    });
  } catch (err) {
    next(err);
  }
};
