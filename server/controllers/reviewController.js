import { WeeklyReview } from '../models/WeeklyReview.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { FocusSession } from '../models/FocusSession.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { getWeekStartEnd, getDateRange, getDayOfWeekIndex } from '../utils/dateHelpers.js';
import { isHabitScheduledOnDate } from '../services/streakService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const generateWeeklyReview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { weekStart, weekEnd } = getWeekStartEnd();
    const dates = getDateRange(weekStart, weekEnd);

    const habits = await Habit.find({ user: userId, isArchived: false });
    const logs = await HabitLog.find({
      user: userId,
      date: { $gte: weekStart, $lte: weekEnd },
    }).lean();
    const focusSessions = await FocusSession.find({
      user: userId,
      date: { $gte: weekStart, $lte: weekEnd },
    }).lean();
    const reflections = await DailyReflection.find({
      user: userId,
      date: { $gte: weekStart, $lte: weekEnd },
    }).lean();

    // Map logs by date and habit
    let totalDue = 0;
    let totalCompleted = 0;
    const habitStats = {};
    habits.forEach((h) => {
      habitStats[h._id.toString()] = { name: h.name, due: 0, completed: 0 };
    });

    const dailyCompletions = {};
    dates.forEach((d) => (dailyCompletions[d] = 0));

    dates.forEach((dateStr) => {
      habits.forEach((h) => {
        if (isHabitScheduledOnDate(h, dateStr)) {
          totalDue++;
          habitStats[h._id.toString()].due++;
        }
      });
    });

    logs.forEach((log) => {
      if (log.isCompleted) {
        totalCompleted++;
        if (dailyCompletions[log.date] !== undefined) {
          dailyCompletions[log.date]++;
        }
        if (habitStats[log.habit.toString()]) {
          habitStats[log.habit.toString()].completed++;
        }
      }
    });

    // Best and difficult days
    let bestDay = dates[0];
    let maxDayCompletions = -1;
    const difficultDays = [];

    Object.entries(dailyCompletions).forEach(([d, count]) => {
      if (count > maxDayCompletions) {
        maxDayCompletions = count;
        bestDay = d;
      }
      if (count === 0) {
        difficultDays.push(d);
      }
    });

    // Most consistent & most missed habit
    let mostConsistentHabit = 'None yet';
    let mostMissedHabit = 'None';
    let bestRate = -1;
    let worstRate = 101;

    Object.values(habitStats).forEach((s) => {
      if (s.due > 0) {
        const rate = (s.completed / s.due) * 100;
        if (rate > bestRate) {
          bestRate = rate;
          mostConsistentHabit = s.name;
        }
        if (rate < worstRate) {
          worstRate = rate;
          mostMissedHabit = s.name;
        }
      }
    });

    // Distraction pattern
    const distractionTally = {};
    reflections.forEach((r) => {
      (r.distractions || []).forEach((d) => {
        distractionTally[d] = (distractionTally[d] || 0) + 1;
      });
    });
    const sortedDistractions = Object.entries(distractionTally).sort((a, b) => b[1] - a[1]);
    const topDistraction = sortedDistractions.length > 0 ? sortedDistractions[0][0] : 'None recorded';

    // Focus time
    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const consistencyPercentage = totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 100;

    // Generate KEEP, IMPROVE, NEXT WEEK
    const keep = [];
    const improve = [];
    const nextWeekSuggestions = [];

    if (mostConsistentHabit !== 'None yet') {
      keep.push(`Your consistency with "${mostConsistentHabit}" is an anchor.`);
    }
    if (totalFocusMinutes > 60) {
      keep.push(`Maintained ${totalFocusMinutes} minutes of focused work blocks.`);
    } else {
      keep.push('Showing up and building the foundation one session at a time.');
    }

    if (mostMissedHabit !== 'None' && worstRate < 50) {
      improve.push(`"${mostMissedHabit}" had higher resistance this week.`);
    }
    if (topDistraction !== 'None recorded') {
      improve.push(`"${topDistraction}" was the recurring source of distraction.`);
    }
    if (improve.length === 0) {
      improve.push('Keep monitoring energy dips in the late afternoon.');
    }

    if (worstRate < 50 && mostMissedHabit !== 'None') {
      nextWeekSuggestions.push(`Reduce target on "${mostMissedHabit}" for 5 days to rebuild ease.`);
    }
    if (topDistraction !== 'None recorded') {
      nextWeekSuggestions.push(`Set a personal rule: no ${topDistraction.toLowerCase()} during prime focus blocks.`);
    }
    nextWeekSuggestions.push('Schedule one non-negotiable 25-minute morning anchor block.');

    return sendSuccess(res, {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalHabitsDue: totalDue,
      totalHabitsCompleted: totalCompleted,
      consistencyPercentage,
      totalFocusMinutes,
      mostConsistentHabit,
      mostMissedHabit,
      topDistraction,
      bestDay,
      difficultDays,
      keep,
      improve,
      nextWeekSuggestions,
    });
  } catch (err) {
    next(err);
  }
};

export const saveWeeklyReview = async (req, res, next) => {
  try {
    const {
      weekStartDate,
      weekEndDate,
      totalHabitsDue,
      totalHabitsCompleted,
      consistencyPercentage,
      totalFocusMinutes,
      mostConsistentHabit,
      mostMissedHabit,
      topDistraction,
      bestDay,
      difficultDays,
      keep,
      improve,
      nextWeekSuggestions,
      userNotes = '',
    } = req.body;

    const review = await WeeklyReview.findOneAndUpdate(
      { user: req.user._id, weekStartDate },
      {
        $set: {
          weekEndDate,
          totalHabitsDue,
          totalHabitsCompleted,
          consistencyPercentage,
          totalFocusMinutes,
          mostConsistentHabit,
          mostMissedHabit,
          topDistraction,
          bestDay,
          difficultDays,
          keep,
          improve,
          nextWeekSuggestions,
          userNotes,
        },
      },
      { upsert: true, new: true }
    );

    return sendSuccess(res, review, 'Weekly review saved successfully');
  } catch (err) {
    next(err);
  }
};

export const getWeeklyReviews = async (req, res, next) => {
  try {
    const reviews = await WeeklyReview.find({ user: req.user._id }).sort({ weekStartDate: -1 });
    return sendSuccess(res, reviews);
  } catch (err) {
    next(err);
  }
};
