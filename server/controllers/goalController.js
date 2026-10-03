import { Goal } from '../models/Goal.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getGoals = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const filter = { user: req.user._id };

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;

    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .populate('linkedHabits', 'name color icon target');

    return sendSuccess(res, goals);
  } catch (err) {
    next(err);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({
      ...req.body,
      user: req.user._id,
    });
    return sendSuccess(res, goal, 'Goal created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id })
      .populate('linkedHabits');
    if (!goal) return sendError(res, 'Goal not found', 404);
    return sendSuccess(res, goal);
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('linkedHabits');

    if (!goal) return sendError(res, 'Goal not found', 404);
    return sendSuccess(res, goal, 'Goal updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return sendError(res, 'Goal not found', 404);
    return sendSuccess(res, null, 'Goal deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const toggleMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return sendError(res, 'Goal not found', 404);

    const ms = goal.milestones.id(milestoneId);
    if (!ms) return sendError(res, 'Milestone not found', 404);

    ms.isCompleted = !ms.isCompleted;
    ms.completedAt = ms.isCompleted ? new Date() : null;

    // Recalculate progress based on milestones if milestones exist
    if (goal.milestones.length > 0) {
      const completedCount = goal.milestones.filter((m) => m.isCompleted).length;
      goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
      if (goal.progress === 100) {
        goal.status = 'completed';
      }
    }

    await goal.save();
    return sendSuccess(res, goal, 'Milestone updated');
  } catch (err) {
    next(err);
  }
};
