import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { FocusSession } from '../models/FocusSession.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { Goal } from '../models/Goal.js';
import { getDaysAgoString, getTodayString } from '../utils/dateHelpers.js';
import { ENV } from '../config/env.js';

export const generateAICoachInsights = async (userId) => {
  const startDate = getDaysAgoString(7);
  const today = getTodayString();

  // 1. Gather recent data
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
  const goals = await Goal.find({ user: userId, status: 'in_progress' }).lean();

  // Habit metrics
  const habitStats = {};
  for (const h of habits) {
    habitStats[h._id.toString()] = {
      name: h.name,
      target: h.target,
      completedDays: 0,
      totalLogs: 0,
      actualSum: 0,
    };
  }

  for (const log of logs) {
    const s = habitStats[log.habit.toString()];
    if (s) {
      s.totalLogs++;
      s.actualSum += log.actualValue || 0;
      if (log.isCompleted) s.completedDays++;
    }
  }

  // Identify most consistent and struggling habits
  let mostConsistent = null;
  let strugglingHabit = null;
  let maxRate = -1;
  let minRate = 101;

  for (const s of Object.values(habitStats)) {
    const rate = s.totalLogs > 0 ? (s.completedDays / 7) * 100 : 0;
    if (rate > maxRate) {
      maxRate = rate;
      mostConsistent = s;
    }
    if (rate < minRate && s.totalLogs > 0) {
      minRate = rate;
      strugglingHabit = s;
    }
  }

  // Distraction tally
  const distractionCounts = {};
  reflections.forEach((r) => {
    (r.distractions || []).forEach((d) => {
      distractionCounts[d] = (distractionCounts[d] || 0) + 1;
    });
  });

  const sortedDistractions = Object.entries(distractionCounts).sort((a, b) => b[1] - a[1]);
  const topDistraction = sortedDistractions.length > 0 ? sortedDistractions[0][0] : null;

  // Focus metrics
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const avgFocusPerDay = Math.round(totalFocusMinutes / 7);

  // Energy & Mood
  const avgEnergy = reflections.length > 0
    ? (reflections.reduce((acc, r) => acc + (r.energyLevel || 3), 0) / reflections.length).toFixed(1)
    : 3.0;

  // Generate data-grounded insights
  const insights = [];

  // Insight 1: Strength Recognition
  if (mostConsistent && mostConsistent.completedDays >= 4) {
    insights.push({
      type: 'strength',
      title: `Strong Momentum in "${mostConsistent.name}"`,
      observation: `You logged ${mostConsistent.completedDays} successful sessions in "${mostConsistent.name}" over the past week.`,
      rationale: 'Recognizing existing strengths reinforces self-efficacy and proves your capacity for routine.',
      suggestion: 'Consider using this habit as an anchor trigger for habit stacking (e.g., right after this habit, execute a 5-minute micro habit).',
    });
  }

  // Insight 2: Friction & Target Calibration
  if (strugglingHabit && minRate < 50) {
    insights.push({
      type: 'calibration',
      title: `Friction Detected: "${strugglingHabit.name}"`,
      observation: `Completion rate for "${strugglingHabit.name}" was ${Math.round(minRate)}% over the last 7 days.`,
      rationale: 'When consistency drops, high friction or excessive initial target value is usually the bottleneck, not personal failure.',
      suggestion: `Try reducing your target temporarily to 50% or 10-15 minutes for 5 consecutive days to rebuild the neurological activation pathway.`,
    });
  }

  // Insight 3: Distraction & Energy Correlation
  if (topDistraction) {
    insights.push({
      type: 'pattern',
      title: `Common Distraction Pattern: ${topDistraction}`,
      observation: `You noted "${topDistraction}" in ${distractionCounts[topDistraction]} of your daily reflections this week.`,
      rationale: 'Distractions frequently serve as relief valves during low energy periods rather than intentional procrastination.',
      suggestion: `Before starting your primary focus block, put your phone in another room or schedule a deliberate 10-minute break before fatigue sets in.`,
    });
  }

  // Insight 4: Focus & Deep Work
  if (totalFocusMinutes > 0) {
    insights.push({
      type: 'focus',
      title: `Deep Work Cadence: ${totalFocusMinutes} mins recorded`,
      observation: `You logged an average of ${avgFocusPerDay} minutes of deep focus per day across ${focusSessions.length} total sessions.`,
      rationale: 'Consistent blocks of 25-50 minutes build cognitive stamina without causing burnout.',
      suggestion: avgFocusPerDay < 30
        ? 'Aim for one dedicated 25-minute Pomodoro session today at your peak productivity hour.'
        : 'Your focus stamina is healthy. Maintain regular scheduled micro-breaks between sessions.',
    });
  }

  // Fallback if brand new user
  if (insights.length === 0) {
    insights.push({
      type: 'welcome',
      title: 'Welcome to DisciplineOS',
      observation: 'Your journey has begun. Initial baseline data is being gathered.',
      rationale: 'The first week is about establishing baseline patterns, not achieving perfection.',
      suggestion: 'Focus on completing 1 or 2 core habits and log a quick 1-minute daily reflection tonight.',
    });
  }

  return {
    summary: `Analyzed ${logs.length} habit logs, ${focusSessions.length} focus sessions, and ${reflections.length} daily reflections over the last 7 days.`,
    insights,
    metrics: {
      totalFocusMinutes,
      avgFocusPerDay,
      topDistraction,
      avgEnergy,
      goalsCount: goals.length,
    },
  };
};
