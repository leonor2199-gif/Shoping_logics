const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const PASSWORD_SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required.'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{7,14}$/, 'Enter a valid international phone number.'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address.'],
  },
  loginPassword: {
    type: String,
    required: [true, 'Login password is required.'],
    select: false,
  },
  withdrawalPassword: {
    type: String,
    required: [true, 'Withdrawal password is required.'],
    select: false,
  },
  status: {
    type: String,
    enum: ['active', 'frozen'],
    default: 'active',
  },
  vipLevel: {
    type: Number,
    default: 1,
    min: 1,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Balance must be a whole minor-currency amount.' },
  },
  totalDeposited: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
    min: 0,
  },
  pendingWithdrawal: {
    type: Number,
    default: 0,
    min: 0,
  },
  bankDetails: {
    bankName: { type: String, trim: true, maxlength: 120 },
    accountNumber: { type: String, trim: true, maxlength: 64 },
    holderName: { type: String, trim: true, maxlength: 120 },
    ifscCode: { type: String, trim: true, uppercase: true, maxlength: 32 },
  },
  profileImage: {
    type: String,
    trim: true,
  },
  lastLoginAt: Date,
}, { timestamps: true });

userSchema.pre('save', async function hashPasswords() {
  if (this.isModified('loginPassword')) {
    this.loginPassword = await bcrypt.hash(this.loginPassword, PASSWORD_SALT_ROUNDS);
  }

  if (this.isModified('withdrawalPassword')) {
    this.withdrawalPassword = await bcrypt.hash(this.withdrawalPassword, PASSWORD_SALT_ROUNDS);
  }
});

userSchema.methods.compareLoginPassword = function compareLoginPassword(password) {
  return bcrypt.compare(password, this.loginPassword);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.loginPassword;
  delete user.withdrawalPassword;
  return user;
};

module.exports = mongoose.model('User', userSchema);
