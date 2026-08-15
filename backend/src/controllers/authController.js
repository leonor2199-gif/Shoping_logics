const Admin = require('../models/Admin');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const {
  validateLoginPassword,
  validateWithdrawalPassword,
} = require('../utils/password');

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function registerUser(req, res) {
  const {
    phone,
    email,
    loginPassword,
    withdrawalPassword,
  } = req.body;

  if (!phone || !loginPassword || !withdrawalPassword) {
    throw badRequest(
      'Phone number, login password, and withdrawal password are required.'
    );
  }

  const loginPasswordError =
    validateLoginPassword(loginPassword);

  const withdrawalPasswordError =
    validateWithdrawalPassword(withdrawalPassword);

  if (loginPasswordError) {
    throw badRequest(loginPasswordError);
  }

  if (withdrawalPasswordError) {
    throw badRequest(withdrawalPasswordError);
  }

  if (loginPassword === withdrawalPassword) {
    throw badRequest(
      'Login and withdrawal passwords must be different.'
    );
  }

  const existingUser = await User.exists({ phone });

  if (existingUser) {
    const error = new Error(
      'An account with this phone number already exists.'
    );

    error.statusCode = 409;
    throw error;
  }

  if (email) {
    const existingEmail = await User.exists({ email });

    if (existingEmail) {
      const error = new Error(
        'An account with this email address already exists.'
      );

      error.statusCode = 409;
      throw error;
    }
  }

  const user = await User.create({
    phone,
    email,
    loginPassword,
    withdrawalPassword,
  });

  const token = signToken(user.id, 'user');

  res.status(201).json({
    success: true,
    token,
    user,
  });
}

async function loginUser(req, res) {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw badRequest(
      'Phone number and password are required.'
    );
  }

  const user = await User.findOne({ phone })
    .select('+loginPassword');

  if (!user || !(await user.compareLoginPassword(password))) {
    const error = new Error(
      'Invalid phone number or password.'
    );

    error.statusCode = 401;
    throw error;
  }

  if (user.status !== 'active') {
    const error = new Error(
      'Account is unavailable.'
    );

    error.statusCode = 403;
    throw error;
  }

  user.lastLoginAt = new Date();

  await user.save();

  res.json({
    success: true,
    token: signToken(user.id, 'user'),
    user,
  });
}

async function loginAdmin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw badRequest(
      'Username and password are required.'
    );
  }

  const admin = await Admin.findOne({
    username: username.toLowerCase(),
  }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    const error = new Error(
      'Invalid username or password.'
    );

    error.statusCode = 401;
    throw error;
  }

  if (admin.status !== 'active') {
    const error = new Error(
      'Account is unavailable.'
    );

    error.statusCode = 403;
    throw error;
  }

  admin.lastLoginAt = new Date();

  await admin.save();

  res.json({
    success: true,
    token: signToken(admin.id, 'admin'),
    admin,
  });
}

function getCurrentAccount(req, res) {
  res.json({
    success: true,
    role: req.auth.role,
    account: req.auth.account,
  });
}

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getCurrentAccount,
};