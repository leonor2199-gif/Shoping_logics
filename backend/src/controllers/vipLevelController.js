const VipLevel = require('../models/VipLevel');

function requireLevel(level) {
  if (!Number.isInteger(level) || level < 1) {
    const error = new Error('VIP level must be a positive integer.');
    error.statusCode = 400;
    throw error;
  }
}

async function listVipLevels(req, res) {
  const filter = req.auth?.role === 'admin' ? {} : { isActive: true };
  const vipLevels = await VipLevel.find(filter).sort({ level: 1 });
  res.json({ success: true, vipLevels });
}

async function createVipLevel(req, res) {
  requireLevel(req.body.level);
  const vipLevel = await VipLevel.create(req.body);
  res.status(201).json({ success: true, vipLevel });
}

async function updateVipLevel(req, res) {
  if (req.body.level !== undefined) requireLevel(req.body.level);
  const vipLevel = await VipLevel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!vipLevel) {
    const error = new Error('VIP level not found.');
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, vipLevel });
}

module.exports = { listVipLevels, createVipLevel, updateVipLevel };
