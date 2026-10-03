import mongoose from 'mongoose';

const jarvisMemorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['goal', 'preference', 'routine', 'difficulty', 'strategy', 'rule', 'general'],
      default: 'general',
    },
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    source: {
      type: String,
      default: 'chat',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

jarvisMemorySchema.index({ user: 1, category: 1 });
jarvisMemorySchema.index({ user: 1, key: 1 });

export const JarvisMemory = mongoose.model('JarvisMemory', jarvisMemorySchema);
