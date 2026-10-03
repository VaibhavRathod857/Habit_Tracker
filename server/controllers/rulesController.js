import { PersonalRule } from '../models/PersonalRule.js';
import { HabitStack } from '../models/HabitStack.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getRules = async (req, res, next) => {
  try {
    const rules = await PersonalRule.find({ user: req.user._id }).sort({ order: 1, createdAt: -1 });
    return sendSuccess(res, rules);
  } catch (err) {
    next(err);
  }
};

export const createRule = async (req, res, next) => {
  try {
    const count = await PersonalRule.countDocuments({ user: req.user._id });
    const rule = await PersonalRule.create({
      ...req.body,
      user: req.user._id,
      order: count,
    });
    return sendSuccess(res, rule, 'Personal rule created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateRule = async (req, res, next) => {
  try {
    const rule = await PersonalRule.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!rule) return sendError(res, 'Rule not found', 404);
    return sendSuccess(res, rule, 'Personal rule updated');
  } catch (err) {
    next(err);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    const rule = await PersonalRule.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!rule) return sendError(res, 'Rule not found', 404);
    return sendSuccess(res, null, 'Personal rule deleted');
  } catch (err) {
    next(err);
  }
};

// Habit Stacks: "After X, I will do Y"
export const getStacks = async (req, res, next) => {
  try {
    const stacks = await HabitStack.find({ user: req.user._id })
      .sort({ order: 1, createdAt: -1 })
      .populate('routineHabit', 'name icon color target');
    return sendSuccess(res, stacks);
  } catch (err) {
    next(err);
  }
};

export const createStack = async (req, res, next) => {
  try {
    const count = await HabitStack.countDocuments({ user: req.user._id });
    const stack = await HabitStack.create({
      ...req.body,
      user: req.user._id,
      order: count,
    });
    return sendSuccess(res, stack, 'Habit stack created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateStack = async (req, res, next) => {
  try {
    const stack = await HabitStack.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!stack) return sendError(res, 'Habit stack not found', 404);
    return sendSuccess(res, stack, 'Habit stack updated');
  } catch (err) {
    next(err);
  }
};

export const deleteStack = async (req, res, next) => {
  try {
    const stack = await HabitStack.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!stack) return sendError(res, 'Habit stack not found', 404);
    return sendSuccess(res, null, 'Habit stack deleted');
  } catch (err) {
    next(err);
  }
};
