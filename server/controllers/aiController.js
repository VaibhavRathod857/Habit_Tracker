import { generateAICoachInsights } from '../services/aiCoachService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAICoachInsights = async (req, res, next) => {
  try {
    const data = await generateAICoachInsights(req.user._id);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
