import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { Goal } from '../models/Goal.js';
import { isHabitScheduledOnDate, checkUserMissedStreak } from '../services/streakService.js';
import { calculateDisciplineScore } from '../services/scoreService.js';
import { getTodayString, getDaysAgoString } from '../utils/dateHelpers.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = getTodayString();
    const user = req.user;

    // 1. Fetch habits and logs
    const allHabits = await Habit.find({ user: userId, isArchived: false }).sort({ order: 1 });
    const todayLogs = await HabitLog.find({ user: userId, date: today }).lean();
    const logMap = new Map();
    todayLogs.forEach((l) => logMap.set(l.habit.toString(), l));

    // Filter today's habits
    let todayHabits = allHabits.filter((h) => isHabitScheduledOnDate(h, today));

    // If bad day mode is active, prioritize minimum viable habits
    if (user.badDayMode && user.badDayMode.active) {
      const minViable = todayHabits.filter((h) => h.isMinimumViable);
      if (minViable.length > 0) {
        todayHabits = minViable;
      }
    }

    const decoratedTodayHabits = todayHabits.map((h) => {
      const log = logMap.get(h._id.toString());
      return {
        _id: h._id,
        name: h.name,
        category: h.category,
        icon: h.icon,
        color: h.color,
        difficulty: h.difficulty,
        target: h.target,
        whyReason: h.whyReason,
        isPaused: h.isPaused,
        isMinimumViable: h.isMinimumViable,
        todayLog: log || {
          actualValue: 0,
          completionRate: 0,
          isCompleted: false,
          notes: '',
        },
      };
    });

    // 2. Fetch today's tasks
    const todayTasks = await Task.find({ user: userId, date: today }).sort({ order: 1, scheduledTime: 1 });

    // 3. Fetch focus sessions
    const focusSessions = await FocusSession.find({ user: userId, date: today });
    const todayFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    // 4. Fetch daily reflection
    const todayReflection = await DailyReflection.findOne({ user: userId, date: today });

    // 5. Goals overview
    const activeGoals = await Goal.find({ user: userId, status: 'in_progress' }).limit(3);

    // 6. Streak & Consistency calculations
    let maxCurrentStreak = 0;
    let maxBestStreak = 0;
    allHabits.forEach((h) => {
      if (h.currentStreak > maxCurrentStreak) maxCurrentStreak = h.currentStreak;
      if (h.bestStreak > maxBestStreak) maxBestStreak = h.bestStreak;
    });

    // Compute 30-day overall consistency
    const thirtyDaysAgo = getDaysAgoString(30);
    const thirtyDaysLogs = await HabitLog.find({
      user: userId,
      date: { $gte: thirtyDaysAgo, $lte: today },
    }).lean();

    const completed30Days = thirtyDaysLogs.filter((l) => l.isCompleted).length;
    const totalPossible30Days = Math.max(1, allHabits.length * 30);
    const overallConsistency = Math.min(100, Math.round((completed30Days / totalPossible30Days) * 100));

    // 7. Discipline Score
    const scoreData = await calculateDisciplineScore(userId, today);

    // 8. Recovery Check
    const missedCheck = await checkUserMissedStreak(userId);

    // 9. Compute "NOW" and "NEXT" priority actions
    const uncompletedHabits = decoratedTodayHabits.filter((h) => !h.todayLog.isCompleted && !h.isPaused);
    const uncompletedTasks = todayTasks.filter((t) => !t.isCompleted);

    let nowAction = null;
    let nextAction = null;

    if (user.badDayMode && user.badDayMode.active) {
      nowAction = {
        type: 'bad_day_action',
        title: uncompletedHabits.length > 0 ? `Minimum Action: ${uncompletedHabits[0].name}` : 'Hydrate & Rest',
        subtitle: 'Bad Day Mode is active. Focus purely on survival, gentleness, and rest.',
        habitId: uncompletedHabits.length > 0 ? uncompletedHabits[0]._id : null,
      };
    } else if (uncompletedTasks.length > 0 && uncompletedTasks[0].scheduledTime) {
      nowAction = {
        type: 'scheduled_task',
        title: uncompletedTasks[0].title,
        subtitle: `Scheduled for ${uncompletedTasks[0].scheduledTime} (${uncompletedTasks[0].estimatedDurationMinutes} mins)`,
        taskId: uncompletedTasks[0]._id,
      };
      if (uncompletedHabits.length > 0) {
        nextAction = {
          type: 'habit',
          title: uncompletedHabits[0].name,
          subtitle: `Target: ${uncompletedHabits[0].target.value} ${uncompletedHabits[0].target.unit}`,
          habitId: uncompletedHabits[0]._id,
        };
      }
    } else if (uncompletedHabits.length > 0) {
      const topHabit = uncompletedHabits[0];
      nowAction = {
        type: 'habit',
        title: topHabit.name,
        subtitle: `Target: ${topHabit.target.value} ${topHabit.target.unit} ${topHabit.whyReason ? '— ' + topHabit.whyReason : ''}`,
        habitId: topHabit._id,
      };
      if (uncompletedHabits.length > 1) {
        nextAction = {
          type: 'habit',
          title: uncompletedHabits[1].name,
          subtitle: `Target: ${uncompletedHabits[1].target.value} ${uncompletedHabits[1].target.unit}`,
          habitId: uncompletedHabits[1]._id,
        };
      } else if (uncompletedTasks.length > 0) {
        nextAction = {
          type: 'task',
          title: uncompletedTasks[0].title,
          subtitle: 'Daily Planner Task',
          taskId: uncompletedTasks[0]._id,
        };
      }
    } else if (!todayReflection) {
      nowAction = {
        type: 'reflection',
        title: 'Complete Daily Reflection',
        subtitle: 'All daily habits done! Take 2 minutes to reflect on what went well and log energy.',
      };
    } else {
      nowAction = {
        type: 'complete',
        title: 'All Disciplines Completed!',
        subtitle: 'Outstanding execution today. Rest well and recharge for tomorrow.',
      };
    }

    // Today completion %
    const totalHabitsToday = decoratedTodayHabits.length;
    const completedHabitsToday = decoratedTodayHabits.filter((h) => h.todayLog.isCompleted).length;
    const habitCompletionPct = totalHabitsToday > 0 ? Math.round((completedHabitsToday / totalHabitsToday) * 100) : 100;

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return sendSuccess(res, {
      greeting,
      today,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        badDayMode: user.badDayMode,
        recoveryMode: user.recoveryMode,
      },
      actionPriority: {
        now: nowAction,
        next: nextAction,
        todayHabitStats: {
          completed: completedHabitsToday,
          total: totalHabitsToday,
          percentage: habitCompletionPct,
        },
        todayTaskStats: {
          completed: todayTasks.filter((t) => t.isCompleted).length,
          total: todayTasks.length,
        },
      },
      streaks: {
        current: maxCurrentStreak,
        best: maxBestStreak,
        overallConsistency,
      },
      focusTime: todayFocusMinutes,
      disciplineScore: user.preferences?.disciplineScoreEnabled !== false ? scoreData : null,
      recoveryCheck: missedCheck,
      todayHabits: decoratedTodayHabits,
      todayTasks,
      todayReflection: Boolean(todayReflection),
      activeGoals,
    });
  } catch (err) {
    next(err);
  }
};
