import mongoose from 'mongoose';

const weeklyReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStartDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    weekEndDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    totalHabitsDue: {
      type: Number,
      default: 0,
    },
    totalHabitsCompleted: {
      type: Number,
      default: 0,
    },
    consistencyPercentage: {
      type: Number,
      default: 0,
    },
    totalFocusMinutes: {
      type: Number,
      default: 0,
    },
    mostConsistentHabit: {
      type: String,
      default: '',
    },
    mostMissedHabit: {
      type: String,
      default: '',
    },
    topDistraction: {
      type: String,
      default: '',
    },
    bestDay: {
      type: String,
      default: '',
    },
    difficultDays: {
      type: [String],
      default: [],
    },
    keep: {
      type: [String], // What is working
      default: [],
    },
    improve: {
      type: [String], // What needs attention
      default: [],
    },
    nextWeekSuggestions: {
      type: [String], // Suggested adjustments
      default: [],
    },
    userNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

weeklyReviewSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

export const WeeklyReview = mongoose.model('WeeklyReview', weeklyReviewSchema);
