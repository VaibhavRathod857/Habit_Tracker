import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) {
      return sendError(res, 'Invalid or expired session. Please log in again.', 401);
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 'User account no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication error: ' + error.message, 401);
  }
};
