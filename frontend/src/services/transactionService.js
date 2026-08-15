import api from "./api";

const transactionService = {
  getMyTransactions: async (params = {}) => {
    const response = await api.get(
      "/finance/transactions/my",
      {
        params,
      }
    );

    return response.data;
  },
};

export default transactionService;