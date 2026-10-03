import crypto from 'crypto';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { Goal } from '../models/Goal.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { generateTokens } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { evaluateAchievements } from '../services/achievementService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      onboardingCompleted: false,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Initialize baseline achievements
    await evaluateAchievements(user._id);

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          preferences: user.preferences,
          lifeAreas: user.lifeAreas,
          onboardingCompleted: user.onboardingCompleted,
          badDayMode: user.badDayMode,
          recoveryMode: user.recoveryMode,
        },
        token: accessToken,
        refreshToken,
      },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          preferences: user.preferences,
          lifeAreas: user.lifeAreas,
          onboardingCompleted: user.onboardingCompleted,
          badDayMode: user.badDayMode,
          recoveryMode: user.recoveryMode,
        },
        token: accessToken,
        refreshToken,
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  return sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      preferences: user.preferences,
      lifeAreas: user.lifeAreas,
      onboardingCompleted: user.onboardingCompleted,
      badDayMode: user.badDayMode,
      recoveryMode: user.recoveryMode,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, preferences, lifeAreas } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }
    if (lifeAreas) user.lifeAreas = lifeAreas;

    await user.save();

    return sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      preferences: user.preferences,
      lifeAreas: user.lifeAreas,
      onboardingCompleted: user.onboardingCompleted,
      badDayMode: user.badDayMode,
      recoveryMode: user.recoveryMode,
    }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return success anyway to avoid user enumeration
      return sendSuccess(
        res,
        null,
        'If an account exists with that email, a password reset link/token has been generated.'
      );
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    return sendSuccess(
      res,
      {
        resetToken, // Provided in response for easy dev/testing demo
      },
      'Password reset token generated. In a production deployment, this is emailed.'
    );
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired password reset token', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendSuccess(res, null, 'Password reset successful. Please log in with your new password.');
  } catch (err) {
    next(err);
  }
};

export const completeOnboarding = async (req, res, next) => {
  try {
    const {
      lifeAreas,
      mainGoals,
      buildHabits,
      wakeTime,
      sleepTime,
      productivityHours,
      notificationPreference,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found', 404);

    if (lifeAreas) user.lifeAreas = lifeAreas;
    if (wakeTime) user.preferences.preferredWakeTime = wakeTime;
    if (sleepTime) user.preferences.preferredSleepTime = sleepTime;
    if (productivityHours) user.preferences.productivityHours = productivityHours;
    if (notificationPreference) user.preferences.notificationLevel = notificationPreference;
    user.onboardingCompleted = true;
    await user.save();

    // Optionally create starting habits if provided
    if (Array.isArray(buildHabits) && buildHabits.length > 0) {
      for (let i = 0; i < buildHabits.length; i++) {
        const item = buildHabits[i];
        if (typeof item === 'string' && item.trim()) {
          await Habit.create({
            user: user._id,
            name: item.trim(),
            category: lifeAreas && lifeAreas[0] ? lifeAreas[0] : 'Personal development',
            target: { value: 1, unit: 'binary' },
            order: i,
          });
        }
      }
    }

    // Optionally create main goal if provided
    if (Array.isArray(mainGoals) && mainGoals.length > 0 && mainGoals[0].trim()) {
      await Goal.create({
        user: user._id,
        title: mainGoals[0].trim(),
        category: lifeAreas && lifeAreas[0] ? lifeAreas[0] : 'Career',
      });
    }

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        lifeAreas: user.lifeAreas,
        onboardingCompleted: user.onboardingCompleted,
      },
    }, 'Onboarding completed successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Habit.deleteMany({ user: userId });
    await HabitLog.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });
    await Task.deleteMany({ user: userId });
    await FocusSession.deleteMany({ user: userId });
    await DailyReflection.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.clearCookie('accessToken');
    return sendSuccess(res, null, 'Account and all associated data permanently deleted');
  } catch (err) {
    next(err);
  }
};
