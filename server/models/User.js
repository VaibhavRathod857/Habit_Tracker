import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      disciplineScoreEnabled: {
        type: Boolean,
        default: true,
      },
      notificationLevel: {
        type: String,
        enum: ['minimal', 'normal', 'frequent', 'off'],
        default: 'normal',
      },
      preferredWakeTime: {
        type: String,
        default: '06:30',
      },
      preferredSleepTime: {
        type: String,
        default: '23:00',
      },
      productivityHours: {
        type: String,
        default: 'morning',
      },
    },
    lifeAreas: {
      type: [String],
      default: [
        'Career',
        'Study',
        'Fitness',
        'Health',
        'Mental wellbeing',
        'Reading',
        'Personal development',
      ],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    badDayMode: {
      active: { type: Boolean, default: false },
      activatedAt: { type: Date, default: null },
      notes: { type: String, default: '' },
    },
    recoveryMode: {
      active: { type: Boolean, default: false },
      activatedAt: { type: Date, default: null },
      durationDays: { type: Number, default: 3 },
      targetReductionPct: { type: Number, default: 50 },
      endsAt: { type: Date, default: null },
    },
    jarvisSettings: {
      enabled: { type: Boolean, default: true },
      personality: {
        type: String,
        enum: ['calm', 'direct', 'encouraging'],
        default: 'calm',
      },
      responseLength: {
        type: String,
        enum: ['short', 'normal', 'detailed'],
        default: 'normal',
      },
      proactiveInsights: { type: Boolean, default: true },
      memoryEnabled: { type: Boolean, default: true },
      voiceEnabled: { type: Boolean, default: false },
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
