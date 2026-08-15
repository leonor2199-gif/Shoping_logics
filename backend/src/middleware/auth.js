const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

async function authenticate(req, res, next) {
  const authorization = req.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    const error = new Error('Authentication is required.');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const payload = verifyToken(authorization.slice(7));
    const Model = payload.role === 'admin' ? Admin : User;
    const account = await Model.findById(payload.sub);

    if (!account || account.status !== 'active') {
      const error = new Error('Account is unavailable.');
      error.statusCode = 401;
      return next(error);
    }

    req.auth = { account, role: payload.role };
    return next();
  } catch (error) {
    const authError = new Error(error instanceof jwt.TokenExpiredError ? 'Authentication token has expired.' : 'Invalid authentication token.');
    authError.statusCode = 401;
    return next(authError);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      const error = new Error('You do not have permission to perform this action.');
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
}

module.exports = { authenticate, requireRole };
