import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// ADMIN REQUEST DETECTION
// =========================================================

function isAdminRequest(config) {
  const url = config?.url || "";

  const method = String(
    config?.method || "get"
  ).toLowerCase();

  // =========================================================
  // ADMIN ROUTES
  // =========================================================

  if (url.startsWith("/admin")) {
    return true;
  }

  // =========================================================
  // PRODUCT ADMIN OPERATIONS
  // =========================================================
  //
  // GET /products is currently public/admin list.
  //
  // Only product CREATE / UPDATE / DELETE requires
  // the admin token.
  //

  if (
    url === "/products" &&
    method === "post"
  ) {
    return true;
  }

  if (
    url.startsWith("/products/") &&
    (
      method === "patch" ||
      method === "delete"
    )
  ) {
    return true;
  }

  // =========================================================
  // BANK CONFIG ADMIN
  // =========================================================

  if (
    url.startsWith(
      "/config/banks/admin"
    )
  ) {
    return true;
  }

  if (
    url === "/config/banks" &&
    method === "post"
  ) {
    return true;
  }

  if (
    url.startsWith(
      "/config/banks/"
    ) &&
    (
      method === "patch" ||
      method === "delete"
    )
  ) {
    return true;
  }

  // =========================================================
  // ADMIN TRANSACTIONS
  // =========================================================

  if (
    url === "/finance/transactions"
  ) {
    return true;
  }

  // =========================================================
  // ADMIN DEPOSIT APPROVAL
  // =========================================================

  if (
    url.startsWith(
      "/finance/deposit/"
    ) &&
    method === "patch"
  ) {
    return true;
  }

  // =========================================================
  // ADMIN WITHDRAWAL APPROVAL
  // =========================================================

  if (
    url.startsWith(
      "/finance/withdraw/"
    ) &&
    method === "patch"
  ) {
    return true;
  }

  return false;
}
// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const adminRequest =
      isAdminRequest(config);

    const token =
      adminRequest
        ? localStorage.getItem(
            "adminToken"
          )
        : localStorage.getItem(
            "userToken"
          );

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        "[API]",
        String(
          config.method || "GET"
        ).toUpperCase(),
        config.url,
        "→",
        adminRequest
          ? "ADMIN"
          : "USER",
        "token:",
        Boolean(token)
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status;

    if (status === 401) {
      const adminRequest =
        isAdminRequest(
          error.config
        );

      console.warn(
        adminRequest
          ? "Admin authentication failed."
          : "User authentication failed.",

        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default api;