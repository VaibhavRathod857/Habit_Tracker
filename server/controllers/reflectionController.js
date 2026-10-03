import { DailyReflection } from '../models/DailyReflection.js';
import { getTodayString } from '../utils/dateHelpers.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getTodayReflection = async (req, res, next) => {
  try {
    const { date = getTodayString() } = req.query;
    const reflection = await DailyReflection.findOne({ user: req.user._id, date });
    return sendSuccess(res, reflection);
  } catch (err) {
    next(err);
  }
};

export const saveReflection = async (req, res, next) => {
  try {
    const {
      date = getTodayString(),
      wentWell = '',
      distractions = [],
      improvements = '',
      mood = 'neutral',
      energyLevel = 3,
    } = req.body;

    const reflection = await DailyReflection.findOneAndUpdate(
      { user: req.user._id, date },
      {
        $set: {
          wentWell,
          distractions,
          improvements,
          mood,
          energyLevel,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return sendSuccess(res, reflection, 'Daily reflection saved');
  } catch (err) {
    next(err);
  }
};

export const getReflectionHistory = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const history = await DailyReflection.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(Number(limit));
    return sendSuccess(res, history);
  } catch (err) {
    next(err);
  }
};
