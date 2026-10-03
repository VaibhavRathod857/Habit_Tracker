import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      enum: [
        'FIRST_HABIT',
        'FIRST_COMPLETION',
        'SEVEN_DAY_STREAK',
        'THIRTY_DAY_STREAK',
        'TEN_HOURS_FOCUS',
        'FIFTY_HOURS_FOCUS',
        'FIRST_WEEK_REVIEW',
        'RECOVERY_HERO',
        'CONSISTENCY_CHAMPION',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'Award',
    },
    isUnlocked: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({ user: 1, code: 1 }, { unique: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);
