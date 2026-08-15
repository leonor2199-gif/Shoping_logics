const mongoose = require('mongoose');

const vipLevelSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  minimumRequirement: {
    type: Number,
    default: 0,
    min: 0,
  },
  benefits: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1_000,
  },
  cashbackMultiplier: {
    type: Number,
    default: 1,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('VipLevel', vipLevelSchema);
