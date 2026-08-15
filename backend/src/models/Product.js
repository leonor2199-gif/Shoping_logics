const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required.'],
    trim: true,
    maxlength: 160,
  },
  description: {
    type: String,
    required: [true, 'Product description is required.'],
    trim: true,
    maxlength: 5_000,
  },
  image: {
    type: String,
    trim: true,
  },
  // Store money in the smallest currency unit (for example, cents), never floats.
  basePrice: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Base price must be a whole minor-currency amount.' },
  },
  cashbackBonus: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Cashback bonus must be a whole minor-currency amount.' },
  },
  minVipLevel: {
    type: Number,
    default: 1,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
    min: 0,
  },
  category: {
    type: String,
    default: 'general',
    trim: true,
    maxlength: 80,
  },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Stock quantity must be a whole number.' },
  },
}, { timestamps: true });

productSchema.index({ isActive: 1, minVipLevel: 1, displayOrder: 1 });
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
