import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import authService from "../services/authService";

import {
  clearAuthStorage,
  clearUserAuthStorage,
  clearAdminAuthStorage,
  getStoredUser,
  getStoredAdmin,
  getToken,
  getAdminToken,
  setStoredUser,
  setStoredAdmin,
  setToken,
  setAdminToken,
} from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const storedUser = getStoredUser();
  const storedAdmin = getStoredAdmin();

  const initialAccount =
    storedUser || storedAdmin || null;

  const initialToken =
    storedUser
      ? getToken()
      : storedAdmin
        ? getAdminToken()
        : null;

  const [user, setUser] =
    useState(initialAccount);

  const [token, setAuthToken] =
    useState(initialToken);

  const [loading, setLoading] =
    useState(true);

  const isAuthenticated =
    Boolean(token && user);

  const isAdmin =
    user?.role === "admin";

  // =========================================================
  // RESTORE SESSION
  // =========================================================

  useEffect(() => {
    const restoreSession = async () => {
      const userToken =
        getToken();

      const adminToken =
        getAdminToken();

      // -------------------------------------------------------
      // USER SESSION
      // -------------------------------------------------------

      if (userToken) {
        try {
          const response =
            await authService.getCurrentUser();

          const account = {
            ...response.account,
            role: "user",
          };

          setUser(account);
          setAuthToken(userToken);
          setStoredUser(account);

          setLoading(false);
          return;
        } catch (error) {
          console.warn(
            "User session could not be restored.",
            error
          );

          clearUserAuthStorage();

          setUser(null);
          setAuthToken(null);
        }
      }

      // -------------------------------------------------------
      // ADMIN SESSION
      // -------------------------------------------------------

      if (adminToken) {
        try {
          const response =
            await authService.getCurrentAdmin();

          const account = {
            ...response.account,
            role: "admin",
          };

          setUser(account);
          setAuthToken(adminToken);
          setStoredAdmin(account);

          setLoading(false);
          return;
        } catch (error) {
          console.warn(
            "Admin session could not be restored.",
            error
          );

          clearAdminAuthStorage();

          setUser(null);
          setAuthToken(null);
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  // =========================================================
  // USER LOGIN
  // =========================================================

  const loginUser = async (credentials) => {
    const response =
      await authService.login(
        credentials
      );

    const authenticatedUser = {
      ...response.user,
      role: "user",
    };

    setToken(response.token);
    setAuthToken(response.token);

    setUser(authenticatedUser);

    setStoredUser(
      authenticatedUser
    );

    return response;
  };

  // =========================================================
  // ADMIN LOGIN
  // =========================================================

  const loginAdmin = async (credentials) => {
    const response =
      await authService.adminLogin(
        credentials
      );

    const authenticatedAdmin = {
      ...response.admin,
      role: "admin",
    };

    setAdminToken(response.token);
    setAuthToken(response.token);

    setUser(authenticatedAdmin);

    setStoredAdmin(
      authenticatedAdmin
    );

    return response;
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (data) => {
    const response =
      await authService.register(
        data
      );

    const registeredUser = {
      ...response.user,
      role: "user",
    };

    setToken(response.token);
    setAuthToken(response.token);

    setUser(registeredUser);

    setStoredUser(
      registeredUser
    );

    return response;
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    if (isAdmin) {
      clearAdminAuthStorage();
    } else {
      clearUserAuthStorage();
    }

    setUser(null);
    setAuthToken(null);

    toast.success(
      "Logged out successfully"
    );
  };

  // =========================================================
  // REFRESH ACCOUNT
  // =========================================================

  const refreshAccount = async () => {
    const response = isAdmin
      ? await authService.getCurrentAdmin()
      : await authService.getCurrentUser();

    const account = {
      ...response.account,
      role: response.role,
    };

    setUser(account);

    if (isAdmin) {
      setStoredAdmin(account);
    } else {
      setStoredUser(account);
    }

    return account;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,

        loginUser,
        loginAdmin,
        register,

        logout,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}