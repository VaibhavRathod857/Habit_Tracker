import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { checkUserMissedStreak } from '../services/streakService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getRecoveryStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const missedCheck = await checkUserMissedStreak(req.user._id);

    // Check if recovery mode has expired
    if (user.recoveryMode && user.recoveryMode.active && user.recoveryMode.endsAt) {
      if (new Date() > new Date(user.recoveryMode.endsAt)) {
        user.recoveryMode.active = false;
        await user.save();
      }
    }

    return sendSuccess(res, {
      recoveryMode: user.recoveryMode,
      badDayMode: user.badDayMode,
      missedStreakCheck: missedCheck,
    });
  } catch (err) {
    next(err);
  }
};

export const activateRecoveryMode = async (req, res, next) => {
  try {
    const { durationDays = 3, targetReductionPct = 50 } = req.body;
    const user = await User.findById(req.user._id);

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + Number(durationDays));

    user.recoveryMode = {
      active: true,
      activatedAt: new Date(),
      durationDays: Number(durationDays),
      targetReductionPct: Number(targetReductionPct),
      endsAt,
    };

    await user.save();

    return sendSuccess(
      res,
      user.recoveryMode,
      `Recovery Mode activated for ${durationDays} days. Habit targets are reduced by ${targetReductionPct}% to help you smoothly restart!`
    );
  } catch (err) {
    next(err);
  }
};

export const completeRecoveryMode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.recoveryMode = {
      active: false,
      activatedAt: null,
      durationDays: 3,
      targetReductionPct: 50,
      endsAt: null,
    };
    await user.save();

    return sendSuccess(res, null, 'Recovery period completed. Welcome back to standard targets!');
  } catch (err) {
    next(err);
  }
};

export const toggleBadDayMode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const currentlyActive = user.badDayMode?.active || false;
    const notes = req.body.notes || '';

    user.badDayMode = {
      active: !currentlyActive,
      activatedAt: !currentlyActive ? new Date() : null,
      notes: !currentlyActive ? notes : '',
    };

    await user.save();

    return sendSuccess(
      res,
      user.badDayMode,
      user.badDayMode.active
        ? 'Bad Day Mode activated. Non-essential demands hidden. Take care of yourself first.'
        : 'Bad Day Mode deactivated. Welcome back!'
    );
  } catch (err) {
    next(err);
  }
};
