import mongoose from 'mongoose';

const personalRuleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ruleText: {
      type: String,
      required: [true, 'Rule text is required'],
      trim: true,
      maxlength: [200, 'Rule cannot exceed 200 characters'],
    },
    category: {
      type: String,
      default: 'Focus',
      enum: ['Focus', 'Digital Wellbeing', 'Sleep', 'Health', 'Mindset', 'General'],
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

export const PersonalRule = mongoose.model('PersonalRule', personalRuleSchema);
