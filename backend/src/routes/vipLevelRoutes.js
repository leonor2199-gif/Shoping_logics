const express = require('express');
const { createVipLevel, listVipLevels, updateVipLevel } = require('../controllers/vipLevelController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', listVipLevels);
router.post('/', authenticate, requireRole('admin'), createVipLevel);
router.patch('/:id', authenticate, requireRole('admin'), updateVipLevel);

module.exports = { vipLevelRouter: router };
