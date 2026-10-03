import { FocusSession } from '../models/FocusSession.js';
import { HabitLog } from '../models/HabitLog.js';
import { Habit } from '../models/Habit.js';
import { evaluateAchievements } from '../services/achievementService.js';
import { recalculateHabitStreaks } from '../services/streakService.js';
import { getTodayString } from '../utils/dateHelpers.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const logFocusSession = async (req, res, next) => {
  try {
    const {
      durationMinutes,
      type = 'pomodoro',
      linkedHabit,
      linkedTask,
      title = 'Focus Session',
      notes = '',
      distractionCount = 0,
      autoLogToHabit = true,
    } = req.body;

    const today = getTodayString();
    const userId = req.user._id;

    if (!durationMinutes || durationMinutes <= 0) {
      return sendError(res, 'Duration minutes must be positive', 400);
    }

    const session = await FocusSession.create({
      user: userId,
      durationMinutes,
      type,
      linkedHabit: linkedHabit || null,
      linkedTask: linkedTask || null,
      title,
      notes,
      distractionCount,
      date: today,
      completedAt: new Date(),
    });

    // If session is tied to a habit and unit is minutes, contribute directly to today's habit log!
    if (linkedHabit && autoLogToHabit) {
      const habit = await Habit.findOne({ _id: linkedHabit, user: userId });
      if (habit) {
        let existingLog = await HabitLog.findOne({ user: userId, habit: linkedHabit, date: today });
        const addedVal = habit.target.unit === 'minutes' ? durationMinutes : 1;
        const newActual = (existingLog ? existingLog.actualValue : 0) + addedVal;
        const targetVal = habit.target.value || 1;
        const isCompleted = newActual >= targetVal;
        const completionRate = targetVal > 0 ? Math.round((newActual / targetVal) * 100) : 100;

        await HabitLog.findOneAndUpdate(
          { user: userId, habit: linkedHabit, date: today },
          {
            $set: {
              targetValue: targetVal,
              actualValue: newActual,
              completionRate,
              isCompleted,
            },
          },
          { upsert: true, new: true }
        );

        await recalculateHabitStreaks(linkedHabit, userId);
      }
    }

    await evaluateAchievements(userId);

    return sendSuccess(res, session, `${durationMinutes} minutes of focused work recorded!`, 201);
  } catch (err) {
    next(err);
  }
};

export const getFocusHistory = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const sessions = await FocusSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('linkedHabit', 'name color icon')
      .populate('linkedTask', 'title');

    return sendSuccess(res, sessions);
  } catch (err) {
    next(err);
  }
};

export const getFocusStats = async (req, res, next) => {
  try {
    const today = getTodayString();
    const sessions = await FocusSession.find({ user: req.user._id });

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const todayMinutes = sessions
      .filter((s) => s.date === today)
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalDistractions = sessions.reduce((acc, s) => acc + (s.distractionCount || 0), 0);

    return sendSuccess(res, {
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      todayMinutes,
      totalSessions: sessions.length,
      totalDistractions,
    });
  } catch (err) {
    next(err);
  }
};
