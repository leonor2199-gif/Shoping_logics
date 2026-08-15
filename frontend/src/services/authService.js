import api from "./api";

const authService = {
  // =========================================================
  // USER LOGIN
  // =========================================================

  login: async (data) => {
    const response = await api.post(
      "/auth/user/login",
      data
    );

    const { token, user } = response.data;

    if (!token) {
      throw new Error(
        "No user token received from server."
      );
    }

    localStorage.setItem(
      "userToken",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    return response.data;
  },

  // Backward-compatible alias
  loginUser: async (data) => {
    return authService.login(data);
  },

  // =========================================================
  // USER REGISTER
  // =========================================================

  register: async (data) => {
    const response = await api.post(
      "/auth/user/register",
      data
    );

    const { token, user } = response.data;

    if (!token) {
      throw new Error(
        "No user token received from server."
      );
    }

    localStorage.setItem(
      "userToken",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    return response.data;
  },

  // =========================================================
  // ADMIN LOGIN
  // =========================================================

  adminLogin: async (data) => {
    const response = await api.post(
      "/auth/admin/login",
      data
    );

    const { token, admin } = response.data;

    if (!token) {
      throw new Error(
        "No admin token received from server."
      );
    }

    localStorage.setItem(
      "adminToken",
      token
    );

    localStorage.setItem(
      "admin",
      JSON.stringify(admin)
    );

    return response.data;
  },

  // Backward-compatible alias
  loginAdmin: async (data) => {
    return authService.adminLogin(data);
  },

  // =========================================================
  // CURRENT USER
  // =========================================================

  getCurrentUser: async () => {
    const response = await api.get(
      "/auth/me"
    );

    return response.data;
  },

  // Backward-compatible alias
  getMe: async () => {
    return authService.getCurrentUser();
  },

  // =========================================================
  // CURRENT ADMIN
  // =========================================================

  getCurrentAdmin: async () => {
    const response = await api.get(
      "/auth/admin/me"
    );

    return response.data;
  },

  // Backward-compatible alias
  getAdminMe: async () => {
    return authService.getCurrentAdmin();
  },

  // =========================================================
  // USER LOGOUT
  // =========================================================

  logoutUser: () => {
    localStorage.removeItem(
      "userToken"
    );

    localStorage.removeItem(
      "user"
    );
  },

  // =========================================================
  // ADMIN LOGOUT
  // =========================================================

  logoutAdmin: () => {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "admin"
    );
  },

  // =========================================================
  // FULL LOGOUT
  // =========================================================

  logout: () => {
    localStorage.removeItem(
      "userToken"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "admin"
    );
  },
};

export default authService;