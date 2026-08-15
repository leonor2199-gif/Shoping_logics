import api from "./api";

const adminService = {
  // =========================================================
  // DASHBOARD
  // =========================================================

  getDashboardStats: async () => {
    const response = await api.get(
      "/admin/dashboard/stats"
    );

    return response.data;
  },


  // =========================================================
  // USERS
  // =========================================================

  getUsers: async ({
    page = 1,
    limit = 20,
    search = "",
    status = "",
  } = {}) => {

    const params = {
      page,
      limit,
    };

    if (search.trim()) {
      params.search =
        search.trim();
    }

    if (status) {
      params.status =
        status;
    }

    const response = await api.get(
      "/admin/users",
      {
        params,
      }
    );

    return response.data;
  },


  // =========================================================
  // USER DETAILS
  // =========================================================

  getUserDetails: async (
    userId
  ) => {

    const response =
      await api.get(
        `/admin/users/${userId}`
      );

    return response.data;
  },


  // =========================================================
  // FREEZE / ACTIVATE
  // =========================================================

  updateUserStatus: async (
    userId,
    status
  ) => {

    const response =
      await api.patch(
        `/admin/users/${userId}/status`,
        {
          status,
        }
      );

    return response.data;
  },


  // =========================================================
  // VIP
  // =========================================================

  updateUserVip: async (
    userId,
    vipLevel
  ) => {

    const response =
      await api.patch(
        `/admin/users/${userId}/vip`,
        {
          vipLevel,
        }
      );

    return response.data;
  },


  // =========================================================
  // PASSWORD MANAGEMENT
  // =========================================================

  updateUserSecurity: async (
    userId,
    data
  ) => {

    const response =
      await api.patch(
        `/admin/users/${userId}/security`,
        data
      );

    return response.data;
  },


  deleteUser: async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const response = await api.delete(
    `/admin/users/${userId}`
  );
    return response.data;
  },

  // =========================================================
  // ADD USER BONUS
  // =========================================================
  //
  // amount is sent in normal currency units.
  //
  // Example:
  //
  // 10.50
  //
  // The backend should convert it to:
  //
  // 1050 minor units.
  //
  // =========================================================

  addUserBonus: async (
    userId,
    amount,
    remarks = ""
  ) => {

    const response =
      await api.post(
        `/admin/users/${userId}/bonus`,
        {
          amount,
          remarks,
        }
      );

    return response.data;
  },


  // =========================================================
  // ORDERS
  // =========================================================

getOrders: async ({
  page = 1,
  limit = 20,
  search = "",
  status = "all",
} = {}) => {

  const params = {
    page,
    limit,
  };


  if (
    search &&
    search.trim()
  ) {
    params.search =
      search.trim();
  }


  if (
    status &&
    status !== "all"
  ) {
    params.status =
      status;
  }


  const response =
    await api.get(
      "/admin/orders",
      {
        params,
      }
    );


  return response.data;
},

  // =========================================================
  // SINGLE ORDER
  // =========================================================

  getOrder: async (
    orderId
  ) => {

    const response =
      await api.get(
        `/orders/${orderId}`
      );

    return response.data;
  },
  // ADD THIS
  deleteOrder: async (orderId) => {
    const response = await api.delete(
      `/admin/orders/${orderId}`
    );

    return response.data;
  },

  // =========================================================
  // TRANSACTIONS
  // =========================================================

  getTransactions: async ({
    page = 1,
    limit = 20,
    type = "",
    status = "",
    phone = "",
    fromDate = "",
    toDate = "",
  } = {}) => {

    const params = {
      page,
      limit,
    };

    if (type) {
      params.type = type;
    }

    if (status) {
      params.status = status;
    }

    if (phone && phone.trim()) {
      params.phone = phone.trim();
    }

    if (fromDate) {
      params.fromDate = fromDate;
    }

    if (toDate) {
      params.toDate = toDate;
    }

    const response = await api.get(
      "/finance/transactions",
      {
        params,
      }
    );

    return response.data;
  },


  // =========================================================
  // APPROVE DEPOSIT
  // =========================================================

  approveDeposit: async (
    transactionId
  ) => {

    const response =
      await api.patch(
        `/finance/deposit/${transactionId}/confirm`
      );

    return response.data;
  },


  // =========================================================
  // REJECT DEPOSIT
  // =========================================================

  rejectDeposit: async (
    transactionId,
    remarks = ""
  ) => {

    const response =
      await api.patch(
        `/finance/deposit/${transactionId}/reject`,
        {
          remarks,
        }
      );

    return response.data;
  },


  // =========================================================
  // APPROVE WITHDRAWAL
  // =========================================================

  approveWithdrawal: async (
    transactionId
  ) => {

    const response =
      await api.patch(
        `/finance/withdraw/${transactionId}/confirm`
      );

    return response.data;
  },


  // =========================================================
  // REJECT WITHDRAWAL
  // =========================================================

  rejectWithdrawal: async (
    transactionId,
    remarks = ""
  ) => {

    const response =
      await api.patch(
        `/finance/withdraw/${transactionId}/reject`,
        {
          remarks,
        }
      );

    return response.data;
  },
};

export default adminService;