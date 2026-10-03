import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    linkedHabit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      default: null,
    },
    linkedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    title: {
      type: String,
      default: 'Deep Focus Session',
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ['pomodoro', 'custom', 'short_break', 'long_break'],
      default: 'pomodoro',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
    distractionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

focusSessionSchema.index({ user: 1, date: 1 });

export const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
