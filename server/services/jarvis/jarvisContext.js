import { User } from '../../models/User.js';
import { Habit } from '../../models/Habit.js';
import { HabitLog } from '../../models/HabitLog.js';
import { Task } from '../../models/Task.js';
import { Goal } from '../../models/Goal.js';
import { FocusSession } from '../../models/FocusSession.js';
import { DailyReflection } from '../../models/DailyReflection.js';
import { PersonalRule } from '../../models/PersonalRule.js';
import { HabitStack } from '../../models/HabitStack.js';
import { Achievement } from '../../models/Achievement.js';
import { JarvisMemory } from '../../models/JarvisMemory.js';
import { getTodayString, getDaysAgoString } from '../../utils/dateHelpers.js';

/**
 * Intelligently retrieves only data relevant to the current user's request.
 * Does not send the entire database to the AI context.
 */
export const buildJarvisContext = async (userId, userMessage = '', options = {}) => {
  const query = userMessage.toLowerCase();
  const today = getTodayString();
  const sevenDaysAgo = getDaysAgoString(7);
  const fourteenDaysAgo = getDaysAgoString(14);

  // 1. Fetch User Profile & Preferences
  const user = await User.findById(userId)
    .select('name preferences lifeAreas onboardingCompleted badDayMode recoveryMode jarvisSettings')
    .lean();

  if (!user) {
    throw new Error('User not found');
  }

  const memoryEnabled = user.jarvisSettings?.memoryEnabled !== false;
  let memories = [];
  if (memoryEnabled) {
    memories = await JarvisMemory.find({ user: userId })
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(10)
      .lean();
  }

  // Determine Context Flags based on query
  const isPlanDay = query.includes('plan') || query.includes('schedule') || options.mode === 'plan_day';
  const isProcrastinating = query.includes('procrastinat') || query.includes('lazy') || query.includes('avoid') || query.includes('stuck') || options.mode === 'procrastination';
  const isFailing = query.includes('fail') || query.includes('missing') || query.includes('struggl') || options.mode === 'failing_analysis';
  const isBadDay = query.includes('bad day') || query.includes('terrible') || query.includes('awful') || query.includes('ruined') || options.mode === 'bad_day';
  const isRecovery = query.includes('recover') || options.mode === 'recovery' || user.recoveryMode?.active;
  const isFocus = query.includes('focus') || query.includes('study') || query.includes('work') || options.mode === 'focus';
  const isWeeklyReview = query.includes('week') || query.includes('review') || options.mode === 'weekly_review';
  const isDistraction = query.includes('distract') || query.includes('youtube') || query.includes('phone') || query.includes('instagram') || query.includes('social media');
  const isRulesOrStacks = query.includes('rule') || query.includes('stack') || query.includes('after ') || query.includes('before ');
  const isGoals = query.includes('goal') || query.includes('aim') || query.includes('target');

  const contextData = {
    user: {
      id: user._id.toString(),
      name: user.name,
      wakeTime: user.preferences?.preferredWakeTime || '06:30',
      sleepTime: user.preferences?.preferredSleepTime || '23:00',
      productivityHours: user.preferences?.productivityHours || 'morning',
      badDayMode: user.badDayMode,
      recoveryMode: user.recoveryMode,
      jarvisSettings: user.jarvisSettings,
    },
    todayDate: today,
    memories: memories.map((m) => ({ category: m.category, key: m.key, value: m.value })),
  };

  // Check if query targets a specific habit by name
  const allUserHabits = await Habit.find({ user: userId, isArchived: false }).lean();
  const targetedHabit = allUserHabits.find((h) => query.includes(h.name.toLowerCase()));

  // 2. Load Today's Habits & Logs (Essential for almost all queries)
  const todayLogs = await HabitLog.find({ user: userId, date: today }).lean();
  const logMap = new Map(todayLogs.map((l) => [l.habit.toString(), l]));

  const habitsWithTodayStatus = allUserHabits.map((h) => {
    const log = logMap.get(h._id.toString());
    return {
      id: h._id.toString(),
      name: h.name,
      category: h.category,
      targetValue: h.target?.value || 1,
      unit: h.target?.unit || 'binary',
      preferredTime: h.preferredTime || 'anytime',
      difficulty: h.difficulty,
      isCompletedToday: log ? log.isCompleted : false,
      actualValueToday: log ? log.actualValue : 0,
      currentStreak: h.currentStreak || 0,
      isMinimumViable: h.isMinimumViable || false,
    };
  });

  contextData.todayHabits = habitsWithTodayStatus;

  // 3. Targeted Habit History (when user asks about a specific habit)
  if (targetedHabit) {
    const habitLogs = await HabitLog.find({
      user: userId,
      habit: targetedHabit._id,
      date: { $gte: fourteenDaysAgo, $lte: today },
    })
      .sort({ date: -1 })
      .lean();

    const completedCount = habitLogs.filter((l) => l.isCompleted).length;
    contextData.targetedHabit = {
      id: targetedHabit._id.toString(),
      name: targetedHabit.name,
      category: targetedHabit.category,
      targetValue: targetedHabit.target?.value || 1,
      unit: targetedHabit.target?.unit || 'binary',
      preferredTime: targetedHabit.preferredTime,
      currentStreak: targetedHabit.currentStreak,
      bestStreak: targetedHabit.bestStreak,
      last14DaysLogs: habitLogs.map((l) => ({
        date: l.date,
        isCompleted: l.isCompleted,
        actualValue: l.actualValue,
        notes: l.notes,
      })),
      completed14DaysCount: completedCount,
      completionRate14Days: Math.round((completedCount / 14) * 100),
    };
  }

  // 4. Planner Tasks (if planning, scheduling, focusing, or asking what to do)
  if (isPlanDay || isProcrastinating || isFocus || query.includes('today') || query.includes('task')) {
    const todayTasks = await Task.find({ user: userId, date: today })
      .sort({ order: 1, scheduledTime: 1 })
      .lean();

    contextData.todayTasks = todayTasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      scheduledTime: t.scheduledTime,
      durationMinutes: t.estimatedDurationMinutes,
      priority: t.priority,
      isCompleted: t.isCompleted,
    }));
  }

  // 5. Weekly Analytics & Completion (if reviewing week, analyzing failure, or bad day)
  if (isWeeklyReview || isFailing || isBadDay || isRecovery) {
    const recentLogs = await HabitLog.find({
      user: userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).lean();

    const recentSessions = await FocusSession.find({
      user: userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).lean();

    const recentReflections = await DailyReflection.find({
      user: userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).lean();

    const totalTargetedDays = allUserHabits.length * 7;
    const completedHabits = recentLogs.filter((l) => l.isCompleted).length;
    const totalFocusMinutes = recentSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    const distractionTally = {};
    recentReflections.forEach((r) => {
      (r.distractions || []).forEach((d) => {
        distractionTally[d] = (distractionTally[d] || 0) + 1;
      });
    });

    contextData.recentAnalytics = {
      completedHabitsPastWeek: completedHabits,
      totalPossiblePastWeek: totalTargetedDays || 1,
      weeklyRatePct: totalTargetedDays > 0 ? Math.round((completedHabits / totalTargetedDays) * 100) : 0,
      totalFocusMinutes,
      recentSessionsCount: recentSessions.length,
      distractionTally,
      recentReflectionsCount: recentReflections.length,
    };
  }

  // 6. Goals Context (if goals queried, planning, or weekly review)
  if (isGoals || isWeeklyReview || isPlanDay) {
    const activeGoals = await Goal.find({ user: userId, status: 'in_progress' })
      .select('title category targetDate progress milestones')
      .lean();

    contextData.goals = activeGoals.map((g) => ({
      id: g._id.toString(),
      title: g.title,
      category: g.category,
      targetDate: g.targetDate ? g.targetDate.toISOString().split('T')[0] : null,
      progress: g.progress,
      milestonesCount: g.milestones?.length || 0,
    }));
  }

  // 7. Rules and Stacks (if relevant)
  if (isRulesOrStacks || isProcrastinating || isPlanDay) {
    const rules = await PersonalRule.find({ user: userId, isActive: true }).lean();
    const stacks = await HabitStack.find({ user: userId, isActive: true }).lean();

    contextData.personalRules = rules.map((r) => ({ id: r._id.toString(), text: r.ruleText, category: r.category }));
    contextData.habitStacks = stacks.map((s) => ({ id: s._id.toString(), cue: s.cue, routine: s.routineHabitName, timeOfDay: s.timeOfDay }));
  }

  // 8. Distractions from recent reflections (if distraction mentioned)
  if (isDistraction) {
    const reflections = await DailyReflection.find({
      user: userId,
      date: { $gte: fourteenDaysAgo, $lte: today },
    })
      .select('date distractions mood')
      .lean();

    const counts = {};
    reflections.forEach((r) => {
      (r.distractions || []).forEach((d) => {
        counts[d] = (counts[d] || 0) + 1;
      });
    });
    contextData.distractionHistory = counts;
  }

  return contextData;
};
