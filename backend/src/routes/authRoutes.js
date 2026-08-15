const express = require('express');
const { getCurrentAccount, loginAdmin, loginUser, registerUser } = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/user/register', authLimiter, registerUser);
router.post('/user/login', authLimiter, loginUser);
router.post('/admin/login', authLimiter, loginAdmin);
router.get('/me', authenticate, getCurrentAccount);
router.get('/admin/me', authenticate, requireRole('admin'), getCurrentAccount);

module.exports = { authRouter: router };
