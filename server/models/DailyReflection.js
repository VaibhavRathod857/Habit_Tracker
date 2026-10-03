import mongoose from 'mongoose';

const dailyReflectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    wentWell: {
      type: String,
      default: '',
      trim: true,
    },
    distractions: {
      type: [String],
      default: [],
    },
    improvements: {
      type: String,
      default: '',
      trim: true,
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'neutral', 'low', 'exhausted', 'tired', 'stressed'],
      default: 'neutral',
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

dailyReflectionSchema.index({ user: 1, date: 1 }, { unique: true });

export const DailyReflection = mongoose.model('DailyReflection', dailyReflectionSchema);
