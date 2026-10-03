import { sendError } from '../utils/responseHandler.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return sendError(res, errorMsg, 400, parsed.error.format());
    }
    req.body = parsed.data;
    next();
  } catch (err) {
    return sendError(res, 'Request validation failed: ' + err.message, 400);
  }
};
