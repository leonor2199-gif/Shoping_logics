import { Navigate, Route, Routes } from "react-router-dom";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// User pages
import Home from "../pages/user/Home";
import Products from "../pages/user/Products";
import ProductDetails from "../pages/user/ProductDetails";
import OrderConfirmation from "../pages/user/OrderConfirmation";
import Orders from "../pages/user/Orders";
import Profile from "../pages/user/Profile";
import Deposit from "../pages/user/Deposit";
import Transactions from "../pages/user/Transactions";
import Withdraw from "../pages/user/Withdraw";

// Admin pages
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminBankAccounts from "../pages/admin/AdminBankAccounts";
import AdminTransactions from "../pages/admin/AdminTransactions";

// Layouts
import UserLayout from "../components/layout/UserLayout";

// Route protection
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =========================
          ADMIN LOGIN
      ========================= */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* =========================
          USER ROUTES
      ========================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>

          <Route
            path="/home"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/orders/:id/confirm"
            element={<OrderConfirmation />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/deposit"
            element={<Deposit />}
          />

          <Route
            path="/withdraw"
            element={<Withdraw />}
          />


          <Route
            path="/transactions"
            element={<Transactions />}
          />


        </Route>
      </Route>

      {/* =========================
          ADMIN
      ========================= */}

      <Route
        element={<AdminRoute />}
      >
        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/bank-accounts"
            element={
              <AdminBankAccounts />
            }
          />

          <Route
            path="/admin/transactions"
            element={
              <AdminTransactions />
            }
          />

          <Route
            path="orders"
            element={
              <AdminOrders />
            }
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />


        </Route>
      </Route>

      {/* =========================
          404
      ========================= */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default AppRoutes;