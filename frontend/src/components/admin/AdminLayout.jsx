import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

function AdminLayout() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    console.log("ADMIN LOGOUT");

    // Only remove ADMIN authentication
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    console.log(
      "Admin token after logout:",
      localStorage.getItem("adminToken")
    );

    console.log(
      "User session still exists:",
      Boolean(
        localStorage.getItem("userToken")
      )
    );

    setMobileMenuOpen(false);

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <div className="admin-layout">

      {/* =========================
          ADMIN SIDEBAR / HEADER
      ========================= */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar__brand">

          <NavLink
            to="/admin"
            className="admin-sidebar__logo"
            onClick={closeMobileMenu}
          >
            <span className="admin-sidebar__logo-icon">
              A
            </span>

            <span>
              ProductShop
            </span>
          </NavLink>

        </div>

        <nav className="admin-sidebar__nav">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-link ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMobileMenu}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `admin-nav-link ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMobileMenu}
          >
            Users
          </NavLink>

          <NavLink
              to="/admin/bank-accounts"
              className={({ isActive }) =>
                `admin-nav-link  ${
                  isActive ? "active" : ""
                }`
              }
            >
              Bank Accounts
            </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `admin-nav-link ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMobileMenu}
          >
            Orders
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `admin-nav-link ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMobileMenu}
          >
            Products
          </NavLink>

          <NavLink
            to="/admin/transactions"
            className={({ isActive }) =>
              `admin-nav-link ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMobileMenu}
          >
            Transactions
          </NavLink>

        </nav>

        {/* Admin Logout */}

        <div className="admin-sidebar__footer">

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN ADMIN AREA
      ========================= */}

      <div className="admin-main">

        {/* Mobile Header */}

        <header className="admin-mobile-header">

          <button
            type="button"
            className="admin-mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(
                (previous) => !previous
              )
            }
            aria-label="Toggle admin navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          <span>
            Admin Panel
          </span>

        </header>

        {/* Mobile Navigation */}

        {mobileMenuOpen && (
          <nav className="admin-mobile-nav">

            <NavLink
              to="/admin"
              end
              onClick={closeMobileMenu}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/users"
              onClick={closeMobileMenu}
            >
              Users
            </NavLink>

            <NavLink
              to="/admin/orders"
              onClick={closeMobileMenu}
            >
              Orders
            </NavLink>

            <NavLink
              to="/admin/products"
              onClick={closeMobileMenu}
            >
              Products
            </NavLink>

            <NavLink
              to="/admin/transactions"
              onClick={closeMobileMenu}
            >
              Transactions
            </NavLink>

            <NavLink
              to="/admin/banks"
              onClick={closeMobileMenu}
            >
              Payment Accounts
            </NavLink>

            <NavLink
              to="/admin/vip"
              onClick={closeMobileMenu}
            >
              VIP Levels
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </nav>
        )}

        {/* Page Content */}

        <main className="admin-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;