import { Habit } from '../../models/Habit.js';
import { HabitLog } from '../../models/HabitLog.js';
import { Goal } from '../../models/Goal.js';
import { Task } from '../../models/Task.js';
import { FocusSession } from '../../models/FocusSession.js';
import { DailyReflection } from '../../models/DailyReflection.js';
import { PersonalRule } from '../../models/PersonalRule.js';
import { HabitStack } from '../../models/HabitStack.js';
import { User } from '../../models/User.js';
import { JarvisMemory } from '../../models/JarvisMemory.js';
import { getTodayString, getDaysAgoString } from '../../utils/dateHelpers.js';
import { evaluateAchievements } from '../achievementService.js';
import { recalculateHabitStreaks } from '../streakService.js';

/**
 * Standard JSON-Schema Tool Definitions for OpenAI, Gemini, and Claude
 */
export const JARVIS_TOOLS_SCHEMA = [
  // 1. getUserProfile
  {
    name: 'getUserProfile',
    description: 'Retrieve authenticated user profile, preferred study hours, wake/sleep routine, and active modes.',
    parameters: {
      type: 'object',
      properties: {},
    },
    isMutating: false,
  },

  // 2. getTodayOverview
  {
    name: 'getTodayOverview',
    description: "Get today's scheduled habits with current completion status, today's planner tasks, and focus time.",
    parameters: {
      type: 'object',
      properties: {},
    },
    isMutating: false,
  },

  // 3. getHabits
  {
    name: 'getHabits',
    description: 'Retrieve list of all active habits, their targets, categories, and current streaks.',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Optional category filter' },
      },
    },
    isMutating: false,
  },

  // 4. getHabitHistory
  {
    name: 'getHabitHistory',
    description: 'Analyze completion history, average performance, and missed days for a specific habit.',
    parameters: {
      type: 'object',
      properties: {
        habitName: { type: 'string', description: 'Name of the habit to analyze (e.g. DSA, Exercise)' },
        days: { type: 'number', description: 'Number of past days to analyze (default 14, max 30)' },
      },
      required: ['habitName'],
    },
    isMutating: false,
  },

  // 5. getGoals
  {
    name: 'getGoals',
    description: 'Get user active goals, target dates, milestones, and current progress percentage.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['in_progress', 'completed', 'abandoned'] },
      },
    },
    isMutating: false,
  },

  // 6. getTasks
  {
    name: 'getTasks',
    description: 'Get daily planner tasks for today or a specific date.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format (defaults to today)' },
      },
    },
    isMutating: false,
  },

  // 7. getFocusSessions
  {
    name: 'getFocusSessions',
    description: 'Get recent focus sessions, total minutes studied, and focus consistency.',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of past days to query (default 7)' },
      },
    },
    isMutating: false,
  },

  // 8. getDailyReflection
  {
    name: 'getDailyReflection',
    description: 'Get daily reflection for today or recent days, including mood, energy, and recorded distractions.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
      },
    },
    isMutating: false,
  },

  // 9. getWeeklyAnalytics
  {
    name: 'getWeeklyAnalytics',
    description: 'Get 7-day performance metrics: habit consistency rate, focus hours, top distractions, and completion summary.',
    parameters: {
      type: 'object',
      properties: {},
    },
    isMutating: false,
  },

  // 10. getDistractionAnalytics
  {
    name: 'getDistractionAnalytics',
    description: 'Analyze most frequent friction points and distractions recorded in recent reflections.',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of days to analyze (default 14)' },
      },
    },
    isMutating: false,
  },

  // --- Mutating Tools (Require User Confirmation in UI) ---

  // 11. createHabit
  {
    name: 'createHabit',
    description: 'Propose creating a new daily or weekly habit. Requires user confirmation before adding to database.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the habit (e.g. Reading, Morning Jog, DSA)' },
        targetValue: { type: 'number', description: 'Numeric target value (e.g. 20, 60, 1)' },
        unit: { type: 'string', enum: ['binary', 'minutes', 'hours', 'pages', 'reps', 'km'], description: 'Unit of measurement' },
        preferredTime: { type: 'string', enum: ['morning', 'afternoon', 'evening', 'anytime'], description: 'Preferred time slot' },
        category: { type: 'string', description: 'Category (Study, Fitness, Career, Reading, Health, etc.)' },
      },
      required: ['name', 'targetValue', 'unit'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 12. updateHabit
  {
    name: 'updateHabit',
    description: 'Propose updating an existing habit target or schedule based on coaching data. Requires confirmation.',
    parameters: {
      type: 'object',
      properties: {
        habitName: { type: 'string', description: 'Name of the habit to update' },
        newTargetValue: { type: 'number', description: 'New target value' },
        newUnit: { type: 'string', description: 'New unit' },
        newPreferredTime: { type: 'string', description: 'New preferred time slot' },
      },
      required: ['habitName'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 13. pauseHabit
  {
    name: 'pauseHabit',
    description: 'Temporarily pause a habit to prevent streak penalties during exams, illness, or travel. Requires confirmation.',
    parameters: {
      type: 'object',
      properties: {
        habitName: { type: 'string', description: 'Name of the habit to pause' },
      },
      required: ['habitName'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 14. deleteHabit
  {
    name: 'deleteHabit',
    description: 'Archive/delete a habit. Requires user confirmation.',
    parameters: {
      type: 'object',
      properties: {
        habitName: { type: 'string', description: 'Name of the habit to delete' },
      },
      required: ['habitName'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 15. startFocusSession
  {
    name: 'startFocusSession',
    description: 'Initiate a deep work or study focus block (e.g. 10 min micro-start, 25 min Pomodoro, 50 min deep work).',
    parameters: {
      type: 'object',
      properties: {
        durationMinutes: { type: 'number', description: 'Duration in minutes (e.g. 10, 25, 45, 50)' },
        title: { type: 'string', description: 'Topic or task (e.g. DSA Trees, Essay Drafting)' },
        habitName: { type: 'string', description: 'Optional associated habit name' },
      },
      required: ['durationMinutes', 'title'],
    },
    isMutating: false, // Starting a timer does not overwrite settings
  },

  // 16. createTask
  {
    name: 'createTask',
    description: 'Propose adding a scheduled task to the daily planner. Requires user confirmation.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        scheduledTime: { type: 'string', description: 'Scheduled time e.g. 14:00' },
        estimatedDurationMinutes: { type: 'number', description: 'Duration in minutes' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['title'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 17. createGoal
  {
    name: 'createGoal',
    description: 'Propose creating a strategic milestone goal. Requires user confirmation.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Goal title (e.g. Placement Ready in 6 Months)' },
        category: { type: 'string', description: 'Category (Career, Health, Study, Finance, etc.)' },
        targetMonths: { type: 'number', description: 'Duration in months' },
      },
      required: ['title'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 18. activateRecoveryMode
  {
    name: 'activateRecoveryMode',
    description: 'Activate 3-day recovery protocol reducing targets by 50% to restart momentum without guilt.',
    parameters: {
      type: 'object',
      properties: {
        durationDays: { type: 'number', description: 'Recovery duration (default 3 days)' },
        reductionPct: { type: 'number', description: 'Target reduction percentage (default 50)' },
      },
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 19. createPersonalRule
  {
    name: 'createPersonalRule',
    description: 'Propose adding a behavioral personal rule (e.g. "No phone during study sessions"). Requires confirmation.',
    parameters: {
      type: 'object',
      properties: {
        ruleText: { type: 'string', description: 'The personal rule statement' },
        category: { type: 'string', enum: ['Focus', 'Digital Wellbeing', 'Sleep', 'Health', 'Mindset', 'General'] },
      },
      required: ['ruleText'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 20. createHabitStack
  {
    name: 'createHabitStack',
    description: 'Propose a habit stack pairing an existing anchor cue to a new routine. Requires confirmation.',
    parameters: {
      type: 'object',
      properties: {
        cue: { type: 'string', description: 'Anchor cue trigger (e.g. After brushing teeth)' },
        routineHabitName: { type: 'string', description: 'Action routine (e.g. 10-minute meditation)' },
      },
      required: ['cue', 'routineHabitName'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },

  // 21. recordDistraction
  {
    name: 'recordDistraction',
    description: 'Record a distraction (e.g. YouTube binge, Instagram scroll) into today\'s daily reflection log.',
    parameters: {
      type: 'object',
      properties: {
        distraction: { type: 'string', description: 'Distraction source or pattern' },
      },
      required: ['distraction'],
    },
    isMutating: true,
    requiresConfirmation: true,
  },
];

/**
 * Server-Side Tool Execution Registry
 * Authenticated userId is strictly injected by the server.
 */
export const jarvisToolRegistry = {
  // 1. getUserProfile
  async getUserProfile(userId) {
    const user = await User.findById(userId)
      .select('name preferences lifeAreas badDayMode recoveryMode jarvisSettings')
      .lean();
    if (!user) return { error: 'User not found' };

    return {
      name: user.name,
      wakeTime: user.preferences?.preferredWakeTime || '06:30',
      sleepTime: user.preferences?.preferredSleepTime || '23:00',
      productivityHours: user.preferences?.productivityHours || 'morning',
      badDayModeActive: Boolean(user.badDayMode?.active),
      recoveryModeActive: Boolean(user.recoveryMode?.active),
      personality: user.jarvisSettings?.personality || 'calm',
    };
  },

  // 2. getTodayOverview
  async getTodayOverview(userId) {
    const today = getTodayString();
    const habits = await Habit.find({ user: userId, isArchived: false }).lean();
    const logs = await HabitLog.find({ user: userId, date: today }).lean();
    const tasks = await Task.find({ user: userId, date: today }).sort({ order: 1 }).lean();
    const sessions = await FocusSession.find({ user: userId, date: today }).lean();
    const reflection = await DailyReflection.findOne({ user: userId, date: today }).lean();

    const logMap = new Map(logs.map((l) => [l.habit.toString(), l]));

    const habitOverview = habits.map((h) => {
      const log = logMap.get(h._id.toString());
      return {
        id: h._id.toString(),
        name: h.name,
        target: h.target,
        preferredTime: h.preferredTime,
        currentStreak: h.currentStreak,
        isCompleted: log ? log.isCompleted : false,
        actualValue: log ? log.actualValue : 0,
      };
    });

    const totalFocusMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    return {
      todayDate: today,
      habitsCount: habits.length,
      completedHabitsCount: habitOverview.filter((h) => h.isCompleted).length,
      pendingHabits: habitOverview.filter((h) => !h.isCompleted),
      completedHabits: habitOverview.filter((h) => h.isCompleted),
      tasks: tasks.map((t) => ({ id: t._id.toString(), title: t.title, scheduledTime: t.scheduledTime, isCompleted: t.isCompleted })),
      todayFocusMinutes: totalFocusMinutes,
      reflectionLogged: Boolean(reflection),
    };
  },

  // 3. getHabits
  async getHabits(userId, { category } = {}) {
    const filter = { user: userId, isArchived: false };
    if (category) filter.category = category;

    const habits = await Habit.find(filter).sort({ order: 1 }).lean();
    return habits.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      category: h.category,
      target: h.target,
      preferredTime: h.preferredTime,
      difficulty: h.difficulty,
      currentStreak: h.currentStreak,
      bestStreak: h.bestStreak,
      isPaused: h.isPaused,
    }));
  },

  // 4. getHabitHistory
  async getHabitHistory(userId, { habitName, days = 14 }) {
    const habit = await Habit.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${habitName.trim()}$`, 'i') },
      isArchived: false,
    }).lean();

    if (!habit) {
      return { error: `Habit "${habitName}" not found.` };
    }

    const startDate = getDaysAgoString(Math.min(days, 30));
    const logs = await HabitLog.find({
      user: userId,
      habit: habit._id,
      date: { $gte: startDate },
    })
      .sort({ date: -1 })
      .lean();

    const completed = logs.filter((l) => l.isCompleted).length;
    const totalActual = logs.reduce((acc, l) => acc + (l.actualValue || 0), 0);
    const avgCompletion = logs.length > 0 ? Math.round(totalActual / logs.length) : 0;

    return {
      habitName: habit.name,
      target: habit.target,
      daysQueried: days,
      completedDays: completed,
      missedDays: Math.max(0, days - completed),
      completionRate: Math.round((completed / days) * 100),
      averageActualValue: avgCompletion,
      currentStreak: habit.currentStreak,
      bestStreak: habit.bestStreak,
      recentLogs: logs.slice(0, 7).map((l) => ({ date: l.date, isCompleted: l.isCompleted, actualValue: l.actualValue })),
    };
  },

  // 5. getGoals
  async getGoals(userId, { status = 'in_progress' } = {}) {
    const goals = await Goal.find({ user: userId, status }).lean();
    return goals.map((g) => ({
      id: g._id.toString(),
      title: g.title,
      category: g.category,
      progress: g.progress,
      targetDate: g.targetDate ? g.targetDate.toISOString().split('T')[0] : null,
      milestonesCount: g.milestones?.length || 0,
    }));
  },

  // 6. getTasks
  async getTasks(userId, { date } = {}) {
    const queryDate = date || getTodayString();
    const tasks = await Task.find({ user: userId, date: queryDate }).sort({ order: 1 }).lean();
    return tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      scheduledTime: t.scheduledTime,
      durationMinutes: t.estimatedDurationMinutes,
      priority: t.priority,
      isCompleted: t.isCompleted,
    }));
  },

  // 7. getFocusSessions
  async getFocusSessions(userId, { days = 7 } = {}) {
    const startDate = getDaysAgoString(days);
    const sessions = await FocusSession.find({ user: userId, date: { $gte: startDate } }).sort({ createdAt: -1 }).lean();
    const totalMins = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    return {
      daysQueried: days,
      totalSessions: sessions.length,
      totalFocusMinutes: totalMins,
      averageDailyMinutes: Math.round(totalMins / Math.max(1, days)),
      recentSessions: sessions.slice(0, 5).map((s) => ({ title: s.title, durationMinutes: s.durationMinutes, date: s.date })),
    };
  },

  // 8. getDailyReflection
  async getDailyReflection(userId, { date } = {}) {
    const queryDate = date || getTodayString();
    const ref = await DailyReflection.findOne({ user: userId, date: queryDate }).lean();
    if (!ref) {
      return { status: 'No reflection recorded for ' + queryDate };
    }
    return {
      date: ref.date,
      wentWell: ref.wentWell,
      distractions: ref.distractions,
      improvements: ref.improvements,
      mood: ref.mood,
      energyLevel: ref.energyLevel,
    };
  },

  // 9. getWeeklyAnalytics
  async getWeeklyAnalytics(userId) {
    const startDate = getDaysAgoString(7);
    const today = getTodayString();

    const habits = await Habit.find({ user: userId, isArchived: false }).lean();
    const logs = await HabitLog.find({ user: userId, date: { $gte: startDate, $lte: today } }).lean();
    const sessions = await FocusSession.find({ user: userId, date: { $gte: startDate, $lte: today } }).lean();
    const reflections = await DailyReflection.find({ user: userId, date: { $gte: startDate, $lte: today } }).lean();

    const completed = logs.filter((l) => l.isCompleted).length;
    const totalFocus = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    const distractionTally = {};
    reflections.forEach((r) => {
      (r.distractions || []).forEach((d) => {
        distractionTally[d] = (distractionTally[d] || 0) + 1;
      });
    });

    return {
      totalHabits: habits.length,
      completedLogsPastWeek: completed,
      totalFocusMinutes: totalFocus,
      focusSessionsCount: sessions.length,
      distractionSummary: distractionTally,
    };
  },

  // 10. getDistractionAnalytics
  async getDistractionAnalytics(userId, { days = 14 } = {}) {
    const startDate = getDaysAgoString(days);
    const reflections = await DailyReflection.find({ user: userId, date: { $gte: startDate } }).lean();

    const tally = {};
    reflections.forEach((r) => {
      (r.distractions || []).forEach((d) => {
        tally[d] = (tally[d] || 0) + 1;
      });
    });

    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return {
      daysAnalyzed: days,
      topDistractions: sorted.map(([item, count]) => ({ item, count })),
    };
  },

  // 11. startFocusSession
  async startFocusSession(userId, { durationMinutes, title, habitName }) {
    const today = getTodayString();
    let habitId = null;

    if (habitName) {
      const habit = await Habit.findOne({
        user: userId,
        name: { $regex: new RegExp(`^${habitName.trim()}$`, 'i') },
      });
      if (habit) habitId = habit._id;
    }

    const session = await FocusSession.create({
      user: userId,
      title: title || 'Deep Work Session',
      durationMinutes: durationMinutes || 25,
      type: durationMinutes === 25 ? 'pomodoro' : 'custom',
      date: today,
      linkedHabit: habitId,
    });

    if (habitId) {
      const habit = await Habit.findById(habitId);
      let log = await HabitLog.findOne({ user: userId, habit: habitId, date: today });
      if (!log) {
        log = new HabitLog({
          user: userId,
          habit: habitId,
          date: today,
          actualValue: durationMinutes,
          isCompleted: durationMinutes >= (habit.target?.value || 1),
        });
      } else {
        log.actualValue = (log.actualValue || 0) + durationMinutes;
        if (log.actualValue >= (habit.target?.value || 1)) {
          log.isCompleted = true;
        }
      }
      await log.save();
      await recalculateHabitStreaks(habitId, userId);
    }

    await evaluateAchievements(userId);

    return {
      success: true,
      message: `Focus session of ${durationMinutes} minutes initiated for "${title}".`,
      sessionId: session._id.toString(),
      durationMinutes,
      title,
    };
  },

  // --- Mutating Execution Implementations (Called upon user confirmation) ---

  async executeCreateHabit(userId, args) {
    const count = await Habit.countDocuments({ user: userId, isArchived: false });
    const habit = await Habit.create({
      user: userId,
      name: args.name.trim(),
      category: args.category || 'Personal development',
      target: {
        value: args.targetValue || 1,
        unit: args.unit || 'binary',
      },
      preferredTime: args.preferredTime || 'anytime',
      order: count,
    });

    await evaluateAchievements(userId);
    return { success: true, message: `Habit "${habit.name}" created successfully.`, habitId: habit._id.toString() };
  },

  async executeUpdateHabit(userId, args) {
    const habit = await Habit.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${args.habitName.trim()}$`, 'i') },
      isArchived: false,
    });
    if (!habit) return { error: `Habit "${args.habitName}" not found.` };

    if (args.newTargetValue) habit.target.value = args.newTargetValue;
    if (args.newUnit) habit.target.unit = args.newUnit;
    if (args.newPreferredTime) habit.preferredTime = args.newPreferredTime;
    await habit.save();

    return { success: true, message: `Habit "${habit.name}" updated successfully.` };
  },

  async executePauseHabit(userId, args) {
    const habit = await Habit.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${args.habitName.trim()}$`, 'i') },
    });
    if (!habit) return { error: `Habit "${args.habitName}" not found.` };
    habit.isPaused = true;
    await habit.save();
    return { success: true, message: `Habit "${habit.name}" has been paused.` };
  },

  async executeDeleteHabit(userId, args) {
    const habit = await Habit.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${args.habitName.trim()}$`, 'i') },
    });
    if (!habit) return { error: `Habit "${args.habitName}" not found.` };
    habit.isArchived = true;
    await habit.save();
    return { success: true, message: `Habit "${habit.name}" removed.` };
  },

  async executeCreateTask(userId, args) {
    const today = getTodayString();
    const count = await Task.countDocuments({ user: userId, date: today });
    const task = await Task.create({
      user: userId,
      title: args.title.trim(),
      scheduledTime: args.scheduledTime || '',
      estimatedDurationMinutes: args.estimatedDurationMinutes || 30,
      priority: args.priority || 'medium',
      date: today,
      order: count,
    });
    return { success: true, message: `Task "${task.title}" added to planner.`, taskId: task._id.toString() };
  },

  async executeCreateGoal(userId, args) {
    const months = args.targetMonths || 6;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);

    const goal = await Goal.create({
      user: userId,
      title: args.title.trim(),
      category: args.category || 'Career',
      targetDate,
      status: 'in_progress',
    });
    return { success: true, message: `Goal "${goal.title}" created.`, goalId: goal._id.toString() };
  },

  async executeActivateRecoveryMode(userId, args) {
    const days = args.durationDays || 3;
    const pct = args.reductionPct || 50;
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + days);

    const user = await User.findById(userId);
    user.recoveryMode = {
      active: true,
      activatedAt: new Date(),
      durationDays: days,
      targetReductionPct: pct,
      endsAt,
    };
    await user.save();
    return { success: true, message: `Recovery Mode activated for ${days} days with ${pct}% reduced targets.` };
  },

  async executeCreatePersonalRule(userId, args) {
    const rule = await PersonalRule.create({
      user: userId,
      ruleText: args.ruleText.trim(),
      category: args.category || 'Focus',
      isActive: true,
    });
    return { success: true, message: `Personal rule locked: "${rule.ruleText}".`, ruleId: rule._id.toString() };
  },

  async executeCreateHabitStack(userId, args) {
    const stack = await HabitStack.create({
      user: userId,
      cue: args.cue.trim(),
      routineHabitName: args.routineHabitName.trim(),
      isActive: true,
    });
    return { success: true, message: `Habit stack added: After ${stack.cue} → ${stack.routineHabitName}.` };
  },

  async executeRecordDistraction(userId, args) {
    const today = getTodayString();
    let ref = await DailyReflection.findOne({ user: userId, date: today });
    if (!ref) {
      ref = new DailyReflection({ user: userId, date: today, distractions: [args.distraction] });
    } else {
      if (!ref.distractions.includes(args.distraction)) {
        ref.distractions.push(args.distraction);
      }
    }
    await ref.save();
    return { success: true, message: `Recorded "${args.distraction}" as today's distraction pattern.` };
  },
};
