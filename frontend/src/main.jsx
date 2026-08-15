import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { BalanceProvider } from "./context/BalanceContext";

import "./css/main.css";
import "./css/pages/auth.css";
import "./css/layouts/user-layout.css";
import "./css/pages/home.css";
import "./css/pages/products.css";
import "./css/components/product-card.css";
import "./css/pages/product-details.css";
import "./css/pages/order-confirmation.css";
import "./css/pages/orders.css";
import "./css/pages/profile.css";
import "./css/pages/deposit.css";
import "./css/pages/transactions.css";
import "./css/pages/withdraw.css";
import "./css/admin/admin.css";
import "./css/admin/users.css";
import "./css/admin/admin-login.css";
import "./css/admin/admin-products.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BalanceProvider>
          <App />
        </BalanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);