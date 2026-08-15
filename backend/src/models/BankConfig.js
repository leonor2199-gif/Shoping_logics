const mongoose = require('mongoose');

const bankConfigSchema = new mongoose.Schema({
  bankName: { type: String, required: true, trim: true, maxlength: 120 },
  accountNumber: { type: String, required: true, trim: true, maxlength: 64 },
  holderName: { type: String, required: true, trim: true, maxlength: 120 },
  ifscCode: { type: String, trim: true, uppercase: true, maxlength: 32 },
  branch: { type: String, trim: true, maxlength: 120 },
  paymentInstructions: { type: String, trim: true, maxlength: 1_000 },
  qrCodeImage: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

bankConfigSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('BankConfig', bankConfigSchema);
