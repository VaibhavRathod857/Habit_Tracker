import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { recalculateHabitStreaks, isHabitScheduledOnDate } from '../services/streakService.js';
import { evaluateAchievements } from '../services/achievementService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getTodayString } from '../utils/dateHelpers.js';

export const getHabits = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, isArchived, search, date = getTodayString() } = req.query;

    const filter = { user: userId };
    filter.isArchived = isArchived === 'true';

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const habits = await Habit.find(filter).sort({ order: 1, createdAt: -1 }).populate('goal', 'title');

    // Fetch today's logs for these habits
    const todayLogs = await HabitLog.find({
      user: userId,
      date,
    }).lean();

    const logMap = new Map();
    todayLogs.forEach((l) => logMap.set(l.habit.toString(), l));

    // Decorate habits with scheduled status and today's log
    const decoratedHabits = habits.map((h) => {
      const habitObj = h.toObject();
      const log = logMap.get(h._id.toString());
      habitObj.isScheduledToday = isHabitScheduledOnDate(h, date);
      habitObj.todayLog = log || {
        actualValue: 0,
        completionRate: 0,
        isCompleted: false,
        notes: '',
        mood: '',
      };
      return habitObj;
    });

    return sendSuccess(res, decoratedHabits);
  } catch (err) {
    next(err);
  }
};

export const createHabit = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count = await Habit.countDocuments({ user: userId });

    const habit = await Habit.create({
      ...req.body,
      user: userId,
      order: count,
    });

    await evaluateAchievements(userId);

    return sendSuccess(res, habit, 'Habit created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getHabitById = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id }).populate('goal');
    if (!habit) return sendError(res, 'Habit not found', 404);

    const recentLogs = await HabitLog.find({ habit: habit._id, user: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    return sendSuccess(res, { habit, recentLogs });
  } catch (err) {
    next(err);
  }
};

export const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!habit) return sendError(res, 'Habit not found', 404);

    // Recalculate streak in case target or frequency changed
    await recalculateHabitStreaks(habit._id, req.user._id);

    return sendSuccess(res, habit, 'Habit updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteHabit = async (req, res, next) => {
  try {
    const { permanent } = req.query;

    if (permanent === 'true') {
      const deleted = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!deleted) return sendError(res, 'Habit not found', 404);
      await HabitLog.deleteMany({ habit: req.params.id, user: req.user._id });
      return sendSuccess(res, null, 'Habit permanently deleted');
    } else {
      const habit = await Habit.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isArchived: true },
        { new: true }
      );
      if (!habit) return sendError(res, 'Habit not found', 404);
      return sendSuccess(res, habit, 'Habit archived');
    }
  } catch (err) {
    next(err);
  }
};

export const togglePauseHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return sendError(res, 'Habit not found', 404);

    habit.isPaused = !habit.isPaused;
    await habit.save();

    return sendSuccess(
      res,
      habit,
      habit.isPaused ? 'Habit paused temporarily' : 'Habit resumed'
    );
  } catch (err) {
    next(err);
  }
};

export const reorderHabits = async (req, res, next) => {
  try {
    const { habitOrders } = req.body; // Array of { id, order }
    if (!Array.isArray(habitOrders)) {
      return sendError(res, 'habitOrders must be an array', 400);
    }

    const bulkOps = habitOrders.map((item) => ({
      updateOne: {
        filter: { _id: item.id, user: req.user._id },
        update: { order: item.order },
      },
    }));

    if (bulkOps.length > 0) {
      await Habit.bulkWrite(bulkOps);
    }

    return sendSuccess(res, null, 'Habit order updated');
  } catch (err) {
    next(err);
  }
};

export const logHabit = async (req, res, next) => {
  try {
    const { date, actualValue, notes, mood } = req.body;
    const habitId = req.params.id;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: habitId, user: userId });
    if (!habit) return sendError(res, 'Habit not found', 404);

    // Calculate effective target: check if recovery mode is active
    let targetVal = habit.target.value || 1;
    if (req.user.recoveryMode && req.user.recoveryMode.active) {
      const redPct = req.user.recoveryMode.targetReductionPct || 50;
      targetVal = Math.max(1, Math.round(targetVal * (1 - redPct / 100)));
    }

    const completionRate = targetVal > 0 ? Math.round((actualValue / targetVal) * 100) : 100;
    const isCompleted = actualValue >= targetVal;

    // Upsert habit log to avoid duplicates on same day
    const log = await HabitLog.findOneAndUpdate(
      { user: userId, habit: habitId, date },
      {
        $set: {
          targetValue: targetVal,
          actualValue,
          completionRate,
          isCompleted,
          notes: notes !== undefined ? notes : '',
          mood: mood !== undefined ? mood : '',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Recalculate streak
    const streakData = await recalculateHabitStreaks(habitId, userId);

    // Check achievements
    await evaluateAchievements(userId);

    return sendSuccess(res, {
      log,
      streak: streakData,
    }, 'Habit progress logged');
  } catch (err) {
    next(err);
  }
};

export const getHabitHistory = async (req, res, next) => {
  try {
    const habitId = req.params.id;
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const logs = await HabitLog.find({
      habit: habitId,
      user: userId,
    })
      .sort({ date: -1 })
      .limit(Number(days));

    return sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
};

export const acceptAdaptation = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit || !habit.adaptationSuggestion || !habit.adaptationSuggestion.suggestedTarget) {
      return sendError(res, 'No adaptation suggestion found for this habit', 400);
    }

    const oldTarget = habit.target.value;
    const newTarget = habit.adaptationSuggestion.suggestedTarget;

    habit.target.value = newTarget;
    habit.adaptationSuggestion.status = 'accepted';
    await habit.save();

    return sendSuccess(
      res,
      habit,
      `Target adjusted from ${oldTarget} to ${newTarget} to rebuild consistency!`
    );
  } catch (err) {
    next(err);
  }
};

export const dismissAdaptation = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return sendError(res, 'Habit not found', 404);

    if (habit.adaptationSuggestion) {
      habit.adaptationSuggestion.status = 'dismissed';
      await habit.save();
    }

    return sendSuccess(res, habit, 'Suggestion dismissed');
  } catch (err) {
    next(err);
  }
};
