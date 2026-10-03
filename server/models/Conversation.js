import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Coaching Session',
      trim: true,
      maxlength: 120,
    },
    summary: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      enum: [
        'general',
        'plan_day',
        'procrastination',
        'failing_analysis',
        'bad_day',
        'recovery',
        'weekly_review',
        'focus',
        'routine',
        'goal',
      ],
      default: 'general',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ user: 1, updatedAt: -1 });
conversationSchema.index({ user: 1, title: 'text' });

export const Conversation = mongoose.model('Conversation', conversationSchema);
