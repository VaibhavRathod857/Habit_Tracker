import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { Goal } from '../models/Goal.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { PersonalRule } from '../models/PersonalRule.js';
import { HabitStack } from '../models/HabitStack.js';
import { Achievement } from '../models/Achievement.js';
import { Notification } from '../models/Notification.js';
import { getTodayString, getDaysAgoString } from '../utils/dateHelpers.js';
import { recalculateHabitStreaks } from '../services/streakService.js';
import { evaluateAchievements } from '../services/achievementService.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(ENV.MONGO_URI);
    console.log('[Seed] Connected.');

    const demoEmail = 'demo@disciplineos.com';

    // Clear old demo user data
    const existingDemo = await User.findOne({ email: demoEmail });
    if (existingDemo) {
      console.log('[Seed] Cleaning up previous demo user data...');
      const id = existingDemo._id;
      await Promise.all([
        Habit.deleteMany({ user: id }),
        HabitLog.deleteMany({ user: id }),
        Goal.deleteMany({ user: id }),
        Task.deleteMany({ user: id }),
        FocusSession.deleteMany({ user: id }),
        DailyReflection.deleteMany({ user: id }),
        PersonalRule.deleteMany({ user: id }),
        HabitStack.deleteMany({ user: id }),
        Achievement.deleteMany({ user: id }),
        Notification.deleteMany({ user: id }),
        User.deleteOne({ _id: id }),
      ]);
    }

    console.log('[Seed] Creating Demo User...');
    const user = await User.create({
      name: 'Alex Rivera',
      email: demoEmail,
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      onboardingCompleted: true,
      preferences: {
        theme: 'dark',
        disciplineScoreEnabled: true,
        notificationLevel: 'normal',
        preferredWakeTime: '06:30',
        preferredSleepTime: '23:00',
        productivityHours: 'morning',
      },
      lifeAreas: [
        'Career',
        'Study',
        'Fitness',
        'Health',
        'Mental wellbeing',
        'Reading',
        'Sleep',
      ],
    });

    console.log('[Seed] Creating Goals...');
    const placementGoal = await Goal.create({
      user: user._id,
      title: 'Become Placement Ready & Master DS/Algo',
      description: 'Solve 250+ curated LeetCode problems and build 2 full-stack capstone projects.',
      category: 'Study',
      priority: 'high',
      status: 'in_progress',
      progress: 65,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      milestones: [
        { title: 'Complete Arrays & Hashing', isCompleted: true, completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        { title: 'Complete Trees & Graphs', isCompleted: true, completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { title: 'Complete Dynamic Programming Patterns', isCompleted: false },
        { title: 'System Design Mock Interviews', isCompleted: false },
      ],
    });

    const fitnessGoal = await Goal.create({
      user: user._id,
      title: 'Improve Functional Fitness & Stamina',
      description: 'Run a 10K under 50 minutes and maintain consistent 4x weekly resistance workouts.',
      category: 'Fitness',
      priority: 'medium',
      status: 'in_progress',
      progress: 50,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      milestones: [
        { title: 'Run continuous 5K without stopping', isCompleted: true, completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
        { title: 'Achieve 20 unbroken pull-ups', isCompleted: false },
        { title: 'Register and complete 10K marathon', isCompleted: false },
      ],
    });

    const readingGoal = await Goal.create({
      user: user._id,
      title: 'Read 12 High-Impact Books',
      description: 'Focus on cognitive science, systems thinking, and behavioral economics.',
      category: 'Reading',
      priority: 'low',
      status: 'in_progress',
      progress: 40,
      milestones: [
        { title: 'Read Atomic Habits by James Clear', isCompleted: true },
        { title: 'Read Thinking, Fast and Slow by Daniel Kahneman', isCompleted: true },
        { title: 'Read Deep Work by Cal Newport', isCompleted: false },
        { title: 'Read Antifragile by Nassim Taleb', isCompleted: false },
      ],
    });

    console.log('[Seed] Creating Habits...');
    const habitsData = [
      {
        name: 'DSA Problem Solving',
        description: 'Solve 1-2 medium problems with optimal time complexity.',
        category: 'Study',
        icon: 'Code',
        color: '#6366f1',
        frequency: { type: 'daily' },
        target: { value: 60, unit: 'minutes' },
        preferredTime: 'morning',
        difficulty: 'hard',
        goal: placementGoal._id,
        whyReason: 'Develop rock-solid engineering intuition and crack top tech interviews.',
        order: 0,
      },
      {
        name: 'Morning Workout & Mobility',
        description: 'Compound lifts or tempo run followed by hip/shoulder mobility.',
        category: 'Fitness',
        icon: 'Dumbbell',
        color: '#10b981',
        frequency: { type: 'daily' },
        target: { value: 45, unit: 'minutes' },
        preferredTime: 'morning',
        difficulty: 'medium',
        goal: fitnessGoal._id,
        whyReason: 'Elevates energy, mental clarity, and long-term physical resilience.',
        isMinimumViable: true,
        order: 1,
      },
      {
        name: 'Read Non-Fiction',
        description: 'Read deliberate pages without phone notifications.',
        category: 'Reading',
        icon: 'BookOpen',
        color: '#3b82f6',
        frequency: { type: 'daily' },
        target: { value: 15, unit: 'pages' },
        preferredTime: 'evening',
        difficulty: 'easy',
        goal: readingGoal._id,
        whyReason: 'Compound intellectual capital and sharpen decision making.',
        isMinimumViable: true,
        order: 2,
      },
      {
        name: 'Mindfulness Meditation',
        description: 'Silent breath awareness or body scan.',
        category: 'Mental wellbeing',
        icon: 'Brain',
        color: '#8b5cf6',
        frequency: { type: 'daily' },
        target: { value: 10, unit: 'minutes' },
        preferredTime: 'morning',
        difficulty: 'easy',
        whyReason: 'Rewires attention span and reduces impulse reactivity.',
        isMinimumViable: true,
        order: 3,
      },
      {
        name: 'Deep Work (Core Project)',
        description: 'Uninterrupted building on full stack applications.',
        category: 'Career',
        icon: 'Laptop',
        color: '#f59e0b',
        frequency: { type: 'weekdays' },
        target: { value: 90, unit: 'minutes' },
        preferredTime: 'afternoon',
        difficulty: 'hard',
        whyReason: 'Produce high leverage, tangible software that showcases mastery.',
        order: 4,
      },
      {
        name: 'Digital Curfew & Wind Down',
        description: 'No screens 45 minutes before sleep; journal and stretch.',
        category: 'Sleep',
        icon: 'Moon',
        color: '#ec4899',
        frequency: { type: 'daily' },
        target: { value: 1, unit: 'binary' },
        preferredTime: 'evening',
        difficulty: 'medium',
        whyReason: 'Protects deep REM sleep cycles and next-day cognitive function.',
        isMinimumViable: true,
        order: 5,
      },
      {
        name: 'Hydrate 3 Liters',
        description: 'Maintain cellular hydration throughout the day.',
        category: 'Health',
        icon: 'Droplets',
        color: '#06b6d4',
        frequency: { type: 'daily' },
        target: { value: 3, unit: 'custom', customUnit: 'liters' },
        preferredTime: 'anytime',
        difficulty: 'easy',
        whyReason: 'Brain performance and metabolic efficiency depend on adequate hydration.',
        isMinimumViable: true,
        order: 6,
      },
    ];

    const createdHabits = [];
    for (const h of habitsData) {
      const created = await Habit.create({ ...h, user: user._id });
      createdHabits.push(created);
    }

    // Link habits to goals
    placementGoal.linkedHabits = [createdHabits[0]._id];
    await placementGoal.save();
    fitnessGoal.linkedHabits = [createdHabits[1]._id];
    await fitnessGoal.save();
    readingGoal.linkedHabits = [createdHabits[2]._id];
    await readingGoal.save();

    console.log('[Seed] Populating 45 days of realistic Habit Logs...');
    const moods = ['great', 'good', 'good', 'neutral', 'tired', 'good', 'great'];

    for (let dayOffset = 45; dayOffset >= 0; dayOffset--) {
      const dateStr = getDaysAgoString(dayOffset);
      const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;

      for (let i = 0; i < createdHabits.length; i++) {
        const habit = createdHabits[i];

        // Skip weekdays habit on weekends
        if (habit.frequency.type === 'weekdays' && isWeekend) continue;

        // Simulate realistic human consistency (~80% completion rate)
        // Simulate a minor 2-day dip 14 days ago to showcase recovery
        const isDip = dayOffset === 14 || dayOffset === 13;
        const probability = isDip ? 0.2 : 0.82;
        const completed = Math.random() < probability;

        let actualVal = 0;
        if (completed) {
          actualVal = habit.target.value;
          if (habit.target.unit === 'minutes' && Math.random() < 0.3) {
            actualVal += 15; // Bonus minutes sometimes
          }
        } else if (Math.random() < 0.4) {
          // Partial completion
          actualVal = Math.round(habit.target.value * 0.5);
        }

        const compRate = Math.round((actualVal / habit.target.value) * 100);

        await HabitLog.create({
          user: user._id,
          habit: habit._id,
          date: dateStr,
          targetValue: habit.target.value,
          actualValue: actualVal,
          completionRate: compRate,
          isCompleted: actualVal >= habit.target.value,
          mood: moods[dayOffset % moods.length],
          notes: completed && dayOffset % 5 === 0 ? 'Felt smooth and focused throughout.' : '',
        });
      }
    }

    // Recalculate streaks for each habit
    for (const h of createdHabits) {
      await recalculateHabitStreaks(h._id, user._id);
    }

    console.log('[Seed] Creating Focus Sessions...');
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const dateStr = getDaysAgoString(dayOffset);
      const sessionsCount = (dayOffset % 3 === 0) ? 2 : 1;

      for (let s = 0; s < sessionsCount; s++) {
        const duration = [25, 45, 50, 60][(dayOffset + s) % 4];
        await FocusSession.create({
          user: user._id,
          date: dateStr,
          durationMinutes: duration,
          type: 'pomodoro',
          title: s === 0 ? 'Deep DSA Problem Solving' : 'Frontend UI Engineering',
          linkedHabit: createdHabits[0]._id,
          distractionCount: (dayOffset % 4 === 0) ? 1 : 0,
          completedAt: new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000 + s * 3600000),
        });
      }
    }

    console.log('[Seed] Creating Daily Reflections...');
    const distractionPool = [
      ['Social media', 'Phone'],
      ['YouTube'],
      ['Tiredness'],
      ['Unexpected work'],
      ['Gaming'],
      ['Social media', 'Unexpected work'],
    ];

    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      const dateStr = getDaysAgoString(dayOffset);
      await DailyReflection.create({
        user: user._id,
        date: dateStr,
        wentWell: dayOffset % 2 === 0
          ? 'Completed all morning blocks ahead of schedule. Energy remained high.'
          : 'Recovered focus in the evening after an unpredictable afternoon.',
        distractions: distractionPool[dayOffset % distractionPool.length],
        improvements: 'Protect the 9 AM to 11 AM uninterrupted window with phone in airplane mode.',
        mood: moods[dayOffset % moods.length],
        energyLevel: (dayOffset % 3) + 3,
      });
    }

    console.log('[Seed] Creating Today\'s Planner Tasks...');
    const today = getTodayString();
    const tasksData = [
      {
        title: 'Morning Mobility & 45m Workout',
        scheduledTime: '07:00',
        estimatedDurationMinutes: 45,
        priority: 'high',
        isCompleted: true,
        completedAt: new Date(),
        linkedHabit: createdHabits[1]._id,
        order: 0,
      },
      {
        title: 'DSA Practice: LeetCode Graph Traversal',
        scheduledTime: '09:00',
        estimatedDurationMinutes: 60,
        priority: 'high',
        isCompleted: true,
        completedAt: new Date(),
        linkedHabit: createdHabits[0]._id,
        order: 1,
      },
      {
        title: 'Ship DisciplineOS Architecture & API',
        scheduledTime: '11:30',
        estimatedDurationMinutes: 90,
        priority: 'high',
        isCompleted: false,
        linkedHabit: createdHabits[4]._id,
        order: 2,
      },
      {
        title: 'Team Sync / Code Review',
        scheduledTime: '15:00',
        estimatedDurationMinutes: 30,
        priority: 'medium',
        isCompleted: false,
        order: 3,
      },
      {
        title: 'Read 15 Pages Atomic Habits',
        scheduledTime: '21:30',
        estimatedDurationMinutes: 30,
        priority: 'low',
        isCompleted: false,
        linkedHabit: createdHabits[2]._id,
        order: 4,
      },
    ];

    for (const t of tasksData) {
      await Task.create({ ...t, user: user._id, date: today });
    }

    console.log('[Seed] Creating Personal Rules & Habit Stacks...');
    const rules = [
      { ruleText: 'Never miss twice — if a habit slips today, it is non-negotiable tomorrow.', category: 'Mindset', order: 0 },
      { ruleText: 'No phone or social media during the first 90 minutes of the morning.', category: 'Digital Wellbeing', order: 1 },
      { ruleText: 'Shutdown all engineering work by 10:00 PM to protect sleep architecture.', category: 'Sleep', order: 2 },
      { ruleText: 'Consistency > perfection: 5 minutes of a habit beats 0 minutes every single time.', category: 'General', order: 3 },
    ];
    for (const r of rules) {
      await PersonalRule.create({ ...r, user: user._id });
    }

    const stacks = [
      { cue: 'After brewing morning coffee', routineHabit: createdHabits[3]._id, routineHabitName: '10 min Mindfulness Meditation', timeOfDay: 'morning', order: 0 },
      { cue: 'After shutting down laptop at evening', routineHabit: createdHabits[1]._id, routineHabitName: 'Workout & Mobility', timeOfDay: 'evening', order: 1 },
      { cue: 'After getting into bed', routineHabit: createdHabits[2]._id, routineHabitName: 'Read 15 Pages', timeOfDay: 'night', order: 2 },
    ];
    for (const s of stacks) {
      await HabitStack.create({ ...s, user: user._id });
    }

    console.log('[Seed] Evaluating achievements and notifications...');
    await evaluateAchievements(user._id);

    await Notification.create({
      user: user._id,
      type: 'achievement',
      title: 'Welcome to DisciplineOS!',
      message: 'Your demo environment has been seeded with 45 days of rich data, habits, goals, and focus analytics.',
      link: '/dashboard',
    });

    console.log('\n=============================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('Demo Login Credentials:');
    console.log(`Email:    demo@disciplineos.com`);
    console.log(`Password: password123`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
