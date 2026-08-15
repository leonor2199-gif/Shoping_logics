const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  basePrice: { type: Number, required: true, min: 0 },
  cashbackBonus: { type: Number, required: true, min: 0 },
  // Per agreed rule: this is the charged amount, base price plus bonus.
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true,
  },
  confirmedAt: Date,
  cancelledAt: Date,
  adminNotes: { type: String, trim: true, maxlength: 1_000 },
  balanceTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
}, { timestamps: true });

orderSchema.index({ user: 1, status: 1, createdAt: -1 });
// Enforces the one-active-step workflow even under simultaneous requests.
orderSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('Order', orderSchema);
