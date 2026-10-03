import { z } from 'zod';

export const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(100),
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
  ]).optional().default('Career'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  startDate: z.string().optional(),
  deadline: z.string().nullable().optional(),
  linkedHabits: z.array(z.string()).optional().default([]),
  milestones: z.array(z.object({
    title: z.string().min(1),
    isCompleted: z.boolean().optional().default(false),
  })).optional().default([]),
});
