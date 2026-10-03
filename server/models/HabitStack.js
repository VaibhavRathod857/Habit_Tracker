import mongoose from 'mongoose';

const habitStackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cue: {
      type: String,
      required: [true, 'Trigger cue is required (e.g. After brushing teeth)'],
      trim: true,
      maxlength: [120, 'Cue cannot exceed 120 characters'],
    },
    routineHabit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      default: null,
    },
    routineHabitName: {
      type: String,
      required: [true, 'Action habit name is required'],
      trim: true,
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night', 'anytime'],
      default: 'morning',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const HabitStack = mongoose.model('HabitStack', habitStackSchema);
