import { Task } from '../models/Task.js';
import { getTodayString } from '../utils/dateHelpers.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getTasks = async (req, res, next) => {
  try {
    const { date = getTodayString() } = req.query;
    const tasks = await Task.find({ user: req.user._id, date })
      .sort({ order: 1, scheduledTime: 1 })
      .populate('linkedGoal', 'title')
      .populate('linkedHabit', 'name color icon');

    return sendSuccess(res, tasks);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const date = req.body.date || getTodayString();
    const count = await Task.countDocuments({ user: req.user._id, date });

    const task = await Task.create({
      ...req.body,
      date,
      user: req.user._id,
      order: count,
    });

    return sendSuccess(res, task, 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) return sendError(res, 'Task not found', 404);
    return sendSuccess(res, task, 'Task updated');
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return sendError(res, 'Task not found', 404);
    return sendSuccess(res, null, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

export const toggleTaskComplete = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return sendError(res, 'Task not found', 404);

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;
    await task.save();

    return sendSuccess(res, task, task.isCompleted ? 'Task completed' : 'Task marked incomplete');
  } catch (err) {
    next(err);
  }
};

export const reorderTasks = async (req, res, next) => {
  try {
    const { taskOrders } = req.body; // Array of { id, order }
    if (!Array.isArray(taskOrders)) {
      return sendError(res, 'taskOrders array is required', 400);
    }

    const bulkOps = taskOrders.map((item) => ({
      updateOne: {
        filter: { _id: item.id, user: req.user._id },
        update: { order: item.order },
      },
    }));

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    return sendSuccess(res, null, 'Task order updated');
  } catch (err) {
    next(err);
  }
};
