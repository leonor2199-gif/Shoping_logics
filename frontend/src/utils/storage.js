const USER_TOKEN_KEY = "userToken";
const ADMIN_TOKEN_KEY = "adminToken";
const USER_KEY = "user";
const ADMIN_KEY = "admin";

// =========================================================
// USER TOKEN
// =========================================================

export const getToken = () => {
  return localStorage.getItem(USER_TOKEN_KEY);
};

export const setToken = (token) => {
  if (!token) {
    localStorage.removeItem(USER_TOKEN_KEY);
    return;
  }

  localStorage.setItem(USER_TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
};

// =========================================================
// ADMIN TOKEN
// =========================================================

export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token) => {
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const removeAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

// =========================================================
// USER
// =========================================================

export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const setStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};

export const removeStoredUser = () => {
  localStorage.removeItem(USER_KEY);
};

// =========================================================
// ADMIN
// =========================================================

export const getStoredAdmin = () => {
  const admin = localStorage.getItem(ADMIN_KEY);

  if (!admin) {
    return null;
  }

  try {
    return JSON.parse(admin);
  } catch {
    localStorage.removeItem(ADMIN_KEY);
    return null;
  }
};

export const setStoredAdmin = (admin) => {
  if (!admin) {
    localStorage.removeItem(ADMIN_KEY);
    return;
  }

  localStorage.setItem(
    ADMIN_KEY,
    JSON.stringify(admin)
  );
};

export const removeStoredAdmin = () => {
  localStorage.removeItem(ADMIN_KEY);
};

// =========================================================
// USER LOGOUT
// =========================================================

export const clearUserAuthStorage = () => {
  removeToken();
  removeStoredUser();
};

// =========================================================
// ADMIN LOGOUT
// =========================================================

export const clearAdminAuthStorage = () => {
  removeAdminToken();
  removeStoredAdmin();
};

// =========================================================
// FULL LOGOUT
// =========================================================

export const clearAuthStorage = () => {
  clearUserAuthStorage();
  clearAdminAuthStorage();
};