import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(100),
  description: z.string().optional().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  scheduledTime: z.string().optional().default(''),
  estimatedDurationMinutes: z.number().min(1).optional().default(30),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  linkedGoal: z.string().nullable().optional(),
  linkedHabit: z.string().nullable().optional(),
  order: z.number().optional().default(0),
});
