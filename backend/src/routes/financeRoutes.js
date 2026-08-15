const express = require('express');
const {
  approveDeposit, approveWithdrawal, createDeposit, createWithdrawal, getMyWithdrawalEligibility, declineDeposit, declineWithdrawal,
  getBalance, getDepositBankDetails, listMyTransactions, listTransactions,
} = require('../controllers/financeController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/balance', requireRole('user'), getBalance);
router.get('/deposit/bank-details', requireRole('user'), getDepositBankDetails);
router.get('/transactions/my', requireRole('user'), listMyTransactions);
router.post('/deposit', requireRole('user'), createDeposit);
router.post('/withdraw', requireRole('user'), createWithdrawal);
router.get('/withdrawal/eligibility', requireRole('user'), getMyWithdrawalEligibility);
router.get('/transactions', requireRole('admin'), listTransactions);
router.patch('/deposit/:id/confirm', requireRole('admin'), approveDeposit);
router.patch('/deposit/:id/reject', requireRole('admin'), declineDeposit);
router.patch('/withdraw/:id/confirm', requireRole('admin'), approveWithdrawal);
router.patch('/withdraw/:id/reject', requireRole('admin'), declineWithdrawal);

module.exports = { financeRouter: router };
