const Transaction = require('../models/Transaction');
const BankConfig = require('../models/BankConfig');
const User = require('../models/User');
const {
  confirmDeposit, confirmWithdrawal, rejectDeposit, rejectWithdrawal, requestDeposit, requestWithdrawal, getWithdrawalEligibility,
} = require('../services/financeService');

function getPagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

async function getBalance(req, res) {
  const { balance, pendingWithdrawal, totalDeposited, totalWithdrawn } = req.auth.account;
  res.json({ success: true, balance, pendingWithdrawal, totalDeposited, totalWithdrawn });
}

async function getDepositBankDetails(req, res) {
  const banks = await BankConfig.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
  res.json({ success: true, banks });
}

async function createDeposit(req, res) {
  const transaction = await requestDeposit({
    user: req.auth.account,
    amount: req.body.amount,
    referenceNumber: req.body.referenceNumber,
  });
  res.status(201).json({ success: true, transaction });
}

async function getMyWithdrawalEligibility(req, res) {
  const eligibility = await getWithdrawalEligibility(
    req.auth.account.id
  );

  res.json({
    success: true,
    eligibility,
  });
}

async function createWithdrawal(req, res) {
  const transaction = await requestWithdrawal({
    userId: req.auth.account.id,
    amount: req.body.amount,
    withdrawalPassword: req.body.withdrawalPassword,
  });
  res.status(201).json({ success: true, transaction });
}

async function listMyTransactions(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const [transactions, total] = await Promise.all([
    Transaction.find({ user: req.auth.account.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments({ user: req.auth.account.id }),
  ]);
  res.json({ success: true, transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

async function listTransactions(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  // TYPE
  const allowedTypes = ["deposit", "withdrawal"];
  if (req.query.type && allowedTypes.includes(req.query.type)) {
    filter.type = req.query.type;
  }

  // STATUS
  const allowedStatuses = ["pending", "completed", "failed"];
  if (req.query.status && allowedStatuses.includes(req.query.status)) {
    filter.status = req.query.status;
  }

  // PHONE NUMBER SEARCH
  const search = String(req.query.phone || "").trim();
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({
      phone: {
        $regex: escapedSearch,
        $options: "i",
      },
    })
      .select("_id")
      .lean();

    const userIds = users.map((user) => user._id);

    if (userIds.length === 0) {
      return res.json({
        success: true,
        transactions: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    filter.user = {
      $in: userIds,
    };
  }

  // DATE FILTER
  const fromDate = String(req.query.fromDate || "").trim();
  const toDate = String(req.query.toDate || "").trim();

  if (fromDate || toDate) {
    filter.createdAt = {};

    // From date: 00:00:00.000
    if (fromDate) {
      const start = new Date(`${fromDate}T00:00:00.000`);
      if (!Number.isNaN(start.getTime())) {
        filter.createdAt.$gte = start;
      }
    }

    // To date: 23:59:59.999
    if (toDate) {
      const end = new Date(`${toDate}T23:59:59.999`);
      if (!Number.isNaN(end.getTime())) {
        filter.createdAt.$lte = end;
      }
    }

    // Remove empty date filter
    if (Object.keys(filter.createdAt).length === 0) {
      delete filter.createdAt;
    }
  }

  // QUERY
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("user", "phone email vipLevel balance bankDetails")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  // RESPONSE
  res.json({
    success: true,
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

async function approveDeposit(req, res) {
  const transaction = await confirmDeposit({ transactionId: req.params.id, adminId: req.auth.account.id });
  res.json({ success: true, transaction });
}

async function declineDeposit(req, res) {
  const transaction = await rejectDeposit({ transactionId: req.params.id, adminId: req.auth.account.id, remarks: req.body.remarks });
  res.json({ success: true, transaction });
}

async function approveWithdrawal(req, res) {
  const transaction = await confirmWithdrawal({ transactionId: req.params.id, adminId: req.auth.account.id });
  res.json({ success: true, transaction });
}

async function declineWithdrawal(req, res) {
  const result = await rejectWithdrawal({ transactionId: req.params.id, adminId: req.auth.account.id, remarks: req.body.remarks });
  res.json({ success: true, ...result });
}

module.exports = { getBalance, getDepositBankDetails, createDeposit, createWithdrawal, getMyWithdrawalEligibility, listMyTransactions, listTransactions, approveDeposit, declineDeposit, approveWithdrawal, declineWithdrawal };