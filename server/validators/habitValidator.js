import { z } from 'zod';

export const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(80),
  description: z.string().optional().default(''),
  category: z.enum([
    'Career',
    'Study',
    'Fitness',
    'Health',
    'Mental wellbeing',
    'Reading',
    'Finance',
    'Relationships',
    'Personal development',
    'Sleep',
    'Other',
  ]).optional().default('Personal development'),
  icon: z.string().optional().default('CheckCircle2'),
  color: z.string().optional().default('#4f63e9'),
  frequency: z.object({
    type: z.enum(['daily', 'weekdays', 'weekends', 'specific_days', 'x_times_per_week', 'custom']).default('daily'),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional().default([0, 1, 2, 3, 4, 5, 6]),
    timesPerWeek: z.number().min(1).max(7).optional().default(7),
  }).optional().default({}),
  target: z.object({
    value: z.number().min(1).default(1),
    unit: z.enum(['binary', 'minutes', 'hours', 'pages', 'reps', 'km', 'custom']).default('binary'),
    customUnit: z.string().optional().default(''),
  }).optional().default({}),
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'anytime']).optional().default('anytime'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  goal: z.string().nullable().optional(),
  whyReason: z.string().optional().default(''),
  isMinimumViable: z.boolean().optional().default(false),
});

export const habitLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  actualValue: z.number().min(0, 'Actual value cannot be negative'),
  notes: z.string().optional().default(''),
  mood: z.enum(['great', 'good', 'neutral', 'tired', 'stressed', '']).optional().default(''),
});
