const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { createIdentifier } = require('../utils/identifiers');

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateAmount(amount) {
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw createHttpError('Amount must be a positive whole minor-currency amount.', 400);
  }
}

async function requestDeposit({ user, amount, referenceNumber }) {
  validateAmount(amount);
  return Transaction.create({
    transactionId: createIdentifier('DEP'),
    user: user.id,
    type: 'deposit',
    direction: 'credit',
    amount,
    status: 'pending',
    balanceBefore: user.balance,
    balanceAfter: user.balance,
    description: 'Deposit awaiting administrator confirmation.',
    remarks: referenceNumber,
  });
}

async function confirmDeposit({ transactionId, adminId }) {
  return processDeposit(transactionId, adminId, true);
}

async function rejectDeposit({ transactionId, adminId, remarks }) {
  return processDeposit(transactionId, adminId, false, remarks);
}

async function processDeposit(transactionId, adminId, approve, remarks) {
  if (!mongoose.isObjectIdOrHexString(transactionId)) throw createHttpError('Invalid transaction identifier.', 400);
  const session = await mongoose.startSession();
  let transaction;
  try {
    await session.withTransaction(async () => {
      transaction = await Transaction.findOne({ _id: transactionId, type: 'deposit', status: 'pending' }).session(session);
      if (!transaction) throw createHttpError('Pending deposit request not found.', 404);

      if (approve) {
        const user = await User.findOneAndUpdate(
          { _id: transaction.user, status: 'active' },
          { $inc: { balance: transaction.amount, totalDeposited: transaction.amount } },
          { new: true, session },
        );
        if (!user) throw createHttpError('User account is unavailable.', 409);
        transaction.status = 'completed';
        transaction.balanceAfter = user.balance;
      } else {
        transaction.status = 'failed';
        transaction.remarks = remarks || 'Deposit rejected by administrator.';
      }
      transaction.createdBy = adminId;
      await transaction.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return transaction;
}



/*
 * --------------------------------------------------------------------------
 * WITHDRAWAL ELIGIBILITY
 * --------------------------------------------------------------------------
 *
 * A user must complete every currently active product assigned to their
 * exact VIP level before a withdrawal can be requested.
 *
 * Example:
 *   VIP 1 has 5 active VIP 1 products.
 *   User completed 3 of them.
 *   Withdrawal eligibility = 3 / 5 -> not eligible.
 *
 * Completed means the order has reached confirmed or completed status.
 * The product price is not used here; this is purely a qualification rule.
 * --------------------------------------------------------------------------
 */

async function getWithdrawalEligibility(userId) {
  if (!mongoose.isObjectIdOrHexString(userId)) {
    throw createHttpError(
      'Invalid user identifier.',
      400
    );
  }

  const user = await User.findById(userId)
    .select('vipLevel status')
    .lean();

  if (!user) {
    throw createHttpError(
      'User account not found.',
      404
    );
  }

  const vipLevel = Math.max(
    Number(user.vipLevel) || 1,
    1
  );

  const requiredProducts = await Product.find({
    isActive: true,
    minVipLevel: vipLevel,
  })
    .select('_id name')
    .sort({
      displayOrder: 1,
      createdAt: 1,
    })
    .lean();

  const requiredProductIds = requiredProducts.map(
    (product) => product._id
  );

  let completedProductIds = [];

  if (requiredProductIds.length > 0) {
    completedProductIds = await Order.distinct(
      'product',
      {
        user: userId,
        product: {
          $in: requiredProductIds,
        },
        status: {
          $in: [
            'confirmed',
            'completed',
          ],
        },
      }
    );
  }

  const requiredCount = requiredProductIds.length;
  const completedCount = completedProductIds.length;
  const remainingCount = Math.max(
    requiredCount - completedCount,
    0
  );

  return {
    vipLevel,
    requiredCount,
    completedCount,
    remainingCount,
    eligible:
      requiredCount === 0 ||
      completedCount >= requiredCount,
    requiredProducts: requiredProducts.map(
      (product) => ({
        id: product._id,
        name: product.name,
        completed: completedProductIds.some(
          (completedId) =>
            String(completedId) ===
            String(product._id)
        ),
      })
    ),
  };
}

async function requestWithdrawal({ userId, amount, withdrawalPassword }) {
  validateAmount(amount);
  const session = await mongoose.startSession();
  let transaction;
  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).select('+withdrawalPassword').session(session);
      if (!user || user.status !== 'active') throw createHttpError('User account is unavailable.', 409);

      // Withdrawal is available only after all active products for the
      // user's exact VIP level have been completed.
      const vipLevel = Math.max(
        Number(user.vipLevel) || 1,
        1
      );

      const requiredProductIds = await Product.find({
        isActive: true,
        minVipLevel: vipLevel,
      })
        .distinct('_id')
        .session(session);

      const completedProductIds =
        requiredProductIds.length > 0
          ? await Order.distinct('product', {
              user: user.id,
              product: { $in: requiredProductIds },
              status: {
                $in: ['confirmed', 'completed'],
              },
            }).session(session)
          : [];

      if (
        requiredProductIds.length > 0 &&
        completedProductIds.length < requiredProductIds.length
      ) {
        throw createHttpError(
          `Complete all ${requiredProductIds.length} VIP ${vipLevel} products before requesting a withdrawal. ${completedProductIds.length}/${requiredProductIds.length} completed.`,
          409
        );
      }

      if (!user.bankDetails?.bankName || !user.bankDetails?.accountNumber || !user.bankDetails?.holderName) {
        throw createHttpError('Add bank details before requesting a withdrawal.', 400);
      }
      if (!(await bcrypt.compare(withdrawalPassword || '', user.withdrawalPassword))) {
        throw createHttpError('Withdrawal password is incorrect.', 401);
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: user.id, balance: { $gte: amount } },
        { $inc: { balance: -amount, pendingWithdrawal: amount } },
        { new: true, session },
      );
      if (!updatedUser) throw createHttpError('Insufficient available balance.', 409);

      transaction = (await Transaction.create([{
        transactionId: createIdentifier('WDR'),
        user: user.id,
        type: 'withdrawal',
        direction: 'debit',
        amount,
        status: 'pending',
        balanceBefore: updatedUser.balance + amount,
        balanceAfter: updatedUser.balance,
        description: 'Withdrawal awaiting administrator confirmation.',
      }], { session }))[0];
    });
  } finally {
    await session.endSession();
  }
  return transaction;
}

async function confirmWithdrawal({ transactionId, adminId }) {
  if (!mongoose.isObjectIdOrHexString(transactionId)) throw createHttpError('Invalid transaction identifier.', 400);
  const session = await mongoose.startSession();
  let transaction;
  try {
    await session.withTransaction(async () => {
      transaction = await Transaction.findOne({ _id: transactionId, type: 'withdrawal', status: 'pending' }).session(session);
      if (!transaction) throw createHttpError('Pending withdrawal request not found.', 404);
      const user = await User.findOneAndUpdate(
        { _id: transaction.user, pendingWithdrawal: { $gte: transaction.amount } },
        { $inc: { pendingWithdrawal: -transaction.amount, totalWithdrawn: transaction.amount } },
        { new: true, session },
      );
      if (!user) throw createHttpError('Withdrawal reserve is unavailable.', 409);
      transaction.status = 'completed';
      transaction.createdBy = adminId;
      await transaction.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return transaction;
}

async function rejectWithdrawal({ transactionId, adminId, remarks }) {
  if (!mongoose.isObjectIdOrHexString(transactionId)) throw createHttpError('Invalid transaction identifier.', 400);
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const withdrawal = await Transaction.findOne({ _id: transactionId, type: 'withdrawal', status: 'pending' }).session(session);
      if (!withdrawal) throw createHttpError('Pending withdrawal request not found.', 404);
      const user = await User.findOneAndUpdate(
        { _id: withdrawal.user, pendingWithdrawal: { $gte: withdrawal.amount } },
        { $inc: { balance: withdrawal.amount, pendingWithdrawal: -withdrawal.amount } },
        { new: true, session },
      );
      if (!user) throw createHttpError('Withdrawal reserve is unavailable.', 409);

      withdrawal.status = 'failed';
      withdrawal.createdBy = adminId;
      withdrawal.remarks = remarks || 'Withdrawal rejected by administrator.';
      await withdrawal.save({ session });
      const refund = (await Transaction.create([{
        transactionId: createIdentifier('RFD'),
        user: user.id,
        type: 'refund',
        direction: 'credit',
        amount: withdrawal.amount,
        balanceBefore: user.balance - withdrawal.amount,
        balanceAfter: user.balance,
        relatedTransaction: withdrawal.id,
        createdBy: adminId,
        description: `Refund for rejected withdrawal ${withdrawal.transactionId}.`,
      }], { session }))[0];
      result = { withdrawal, refund, balance: user.balance };
    });
  } finally {
    await session.endSession();
  }
  return result;
}

module.exports = {
  requestDeposit,
  confirmDeposit,
  rejectDeposit,
  requestWithdrawal,
  confirmWithdrawal,
  rejectWithdrawal,
  getWithdrawalEligibility,
  validateAmount,
};
