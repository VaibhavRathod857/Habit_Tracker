import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    targetValue: {
      type: Number,
      required: true,
      default: 1,
    },
    actualValue: {
      type: Number,
      required: true,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0, // e.g. 75 for 75%
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'neutral', 'tired', 'stressed', ''],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate logs for the same habit and date for a user
habitLogSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });
habitLogSchema.index({ user: 1, date: 1 });

export const HabitLog = mongoose.model('HabitLog', habitLogSchema);
