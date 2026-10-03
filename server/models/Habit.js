import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [80, 'Habit name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Personal development',
      enum: [
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
      ],
    },
    icon: {
      type: String,
      default: 'CheckCircle2',
    },
    color: {
      type: String,
      default: '#4f63e9',
    },
    frequency: {
      type: {
        type: String,
        enum: ['daily', 'weekdays', 'weekends', 'specific_days', 'x_times_per_week', 'custom'],
        default: 'daily',
      },
      daysOfWeek: {
        type: [Number], // 0: Sun, 1: Mon, ..., 6: Sat
        default: [0, 1, 2, 3, 4, 5, 6],
      },
      timesPerWeek: {
        type: Number,
        default: 7,
      },
    },
    target: {
      value: {
        type: Number,
        default: 1,
        min: [1, 'Target value must be at least 1'],
      },
      unit: {
        type: String,
        enum: ['binary', 'minutes', 'hours', 'pages', 'reps', 'km', 'custom'],
        default: 'binary',
      },
      customUnit: {
        type: String,
        default: '',
      },
    },
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    whyReason: {
      type: String,
      default: '',
      trim: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    isMinimumViable: {
      type: Boolean,
      default: false, // Flagged for Bad Day / Recovery mode
    },
    order: {
      type: Number,
      default: 0,
    },
    adaptationSuggestion: {
      suggestedTarget: { type: Number, default: null },
      reason: { type: String, default: null },
      status: {
        type: String,
        enum: ['none', 'pending', 'accepted', 'dismissed'],
        default: 'none',
      },
      suggestedAt: { type: Date, default: null },
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    totalCompletions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

habitSchema.index({ user: 1, isArchived: 1, order: 1 });

export const Habit = mongoose.model('Habit', habitSchema);
