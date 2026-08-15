import api from "./api";

const financeService = {
  /*
  |--------------------------------------------------------------------------
  | BALANCE
  |--------------------------------------------------------------------------
  */

  getBalance: async () => {
    const response = await api.get(
      "/finance/balance"
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | DEPOSIT BANK ACCOUNTS
  |--------------------------------------------------------------------------
  |
  | User sees only active bank/payment accounts.
  |
  */

  getDepositBanks: async () => {
    const response = await api.get(
      "/finance/deposit/bank-details"
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | BACKWARD COMPATIBILITY
  |--------------------------------------------------------------------------
  |
  | Keep this because some older components may still use
  | getDepositBankDetails().
  |
  */

  getDepositBankDetails: async () => {
    const response = await api.get(
      "/finance/deposit/bank-details"
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | CREATE DEPOSIT
  |--------------------------------------------------------------------------
  */

  createDeposit: async ({
    amount,
    referenceNumber,
  }) => {
    const response = await api.post(
      "/finance/deposit",
      {
        amount,
        referenceNumber,
      }
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | MY TRANSACTIONS
  |--------------------------------------------------------------------------
  */

  getMyTransactions: async ({
    page = 1,
    limit = 20,
  } = {}) => {
    const response = await api.get(
      "/finance/transactions/my",
      {
        params: {
          page,
          limit,
        },
      }
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | WITHDRAWAL ELIGIBILITY
  |--------------------------------------------------------------------------
  */

  getWithdrawalEligibility: async () => {
    const response = await api.get(
      "/finance/withdrawal/eligibility"
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | WITHDRAW
  |--------------------------------------------------------------------------
  */

  createWithdrawal: async ({
    amount,
    withdrawalPassword,
  }) => {
    const response = await api.post(
      "/finance/withdraw",
      {
        amount,
        withdrawalPassword,
      }
    );

    return response.data;
  },
};

export default financeService;