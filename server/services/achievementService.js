import { Achievement } from '../models/Achievement.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { FocusSession } from '../models/FocusSession.js';
import { Notification } from '../models/Notification.js';

const BADGE_DEFINITIONS = [
  {
    code: 'FIRST_HABIT',
    title: 'First Step Taken',
    description: 'Created your very first habit in DisciplineOS.',
    icon: 'Sparkles',
  },
  {
    code: 'FIRST_COMPLETION',
    title: 'First Win',
    description: 'Completed your first scheduled habit session.',
    icon: 'CheckCircle2',
  },
  {
    code: 'SEVEN_DAY_STREAK',
    title: '7-Day Consistency',
    description: 'Maintained a 7-day uninterrupted habit streak.',
    icon: 'Flame',
  },
  {
    code: 'THIRTY_DAY_STREAK',
    title: 'Month of Mastery',
    description: 'Reached an astounding 30-day streak on any habit.',
    icon: 'Trophy',
  },
  {
    code: 'TEN_HOURS_FOCUS',
    title: 'Deep Work Initiate',
    description: 'Logged over 10 hours (600 minutes) of dedicated focus.',
    icon: 'Timer',
  },
  {
    code: 'FIFTY_HOURS_FOCUS',
    title: 'Focus Virtuoso',
    description: 'Logged over 50 hours of deep focus time.',
    icon: 'Zap',
  },
  {
    code: 'FIRST_WEEK_REVIEW',
    title: 'Reflective Mindset',
    description: 'Completed your first comprehensive weekly review.',
    icon: 'BookOpen',
  },
  {
    code: 'RECOVERY_HERO',
    title: 'The Great Reset',
    description: 'Activated Recovery Mode and successfully returned to consistency.',
    icon: 'RotateCcw',
  },
  {
    code: 'CONSISTENCY_CHAMPION',
    title: 'Consistency > Perfection',
    description: 'Maintained 80%+ overall consistency across all habits for 14+ days.',
    icon: 'ShieldCheck',
  },
];

export const evaluateAchievements = async (userId) => {
  const existingAchievements = await Achievement.find({ user: userId });
  const map = new Map();
  existingAchievements.forEach((a) => map.set(a.code, a));

  // Initialize any missing badges
  for (const def of BADGE_DEFINITIONS) {
    if (!map.has(def.code)) {
      const created = await Achievement.create({
        user: userId,
        code: def.code,
        title: def.title,
        description: def.description,
        icon: def.icon,
        isUnlocked: false,
        progress: 0,
      });
      map.set(def.code, created);
    }
  }

  // Gather stats
  const habitsCount = await Habit.countDocuments({ user: userId });
  const completionsCount = await HabitLog.countDocuments({ user: userId, isCompleted: true });
  const focusSessions = await FocusSession.find({ user: userId });
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const maxStreakHabit = await Habit.findOne({ user: userId }).sort({ currentStreak: -1 });
  const maxStreak = maxStreakHabit ? maxStreakHabit.currentStreak : 0;

  const updates = [];

  const checkAndUnlock = async (code, isMet, progressPct = 0) => {
    const badge = map.get(code);
    if (!badge) return;
    if (!badge.isUnlocked && isMet) {
      badge.isUnlocked = true;
      badge.unlockedAt = new Date();
      badge.progress = 100;
      await badge.save();

      // Trigger notification
      await Notification.create({
        user: userId,
        type: 'achievement',
        title: `Achievement Unlocked: ${badge.title}!`,
        message: badge.description,
        link: '/achievements',
      });
    } else if (!badge.isUnlocked) {
      badge.progress = Math.min(100, Math.max(0, Math.round(progressPct)));
      await badge.save();
    }
  };

  // Evaluate
  await checkAndUnlock('FIRST_HABIT', habitsCount >= 1, habitsCount >= 1 ? 100 : 0);
  await checkAndUnlock('FIRST_COMPLETION', completionsCount >= 1, completionsCount >= 1 ? 100 : 0);
  await checkAndUnlock('SEVEN_DAY_STREAK', maxStreak >= 7, (maxStreak / 7) * 100);
  await checkAndUnlock('THIRTY_DAY_STREAK', maxStreak >= 30, (maxStreak / 30) * 100);
  await checkAndUnlock('TEN_HOURS_FOCUS', totalFocusMinutes >= 600, (totalFocusMinutes / 600) * 100);
  await checkAndUnlock('FIFTY_HOURS_FOCUS', totalFocusMinutes >= 3000, (totalFocusMinutes / 3000) * 100);

  return await Achievement.find({ user: userId }).sort({ isUnlocked: -1, progress: -1 });
};
