import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import BalanceDisplay from "../common/BalanceDisplay";

function UserLayout() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    console.log("CIERRE DE SESIÓN DE USUARIO");

    // Only remove USER authentication
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");

    console.log(
      "Token de usuario después de cerrar sesión:",
      localStorage.getItem("userToken")
    );

    console.log(
      "Sesión de administrador aún existe:",
      Boolean(
        localStorage.getItem("adminToken")
      )
    );

    setMobileMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="user-layout">

      {/* =========================
          HEADER
      ========================= */}

      <header className="site-header">

        <div className="site-header__container">

          {/* Logo */}

          <NavLink
            to="/home"
            className="site-header__logo"
            onClick={closeMobileMenu}
          >
            <span className="site-header__logo-icon">
              <img src="https://play-lh.googleusercontent.com/iVaeA0HDw8CZjEM-K7GdLB9XYmpcwVFSuv4Q8o9uh4Br7PuKCm3QSYCVU73tr9BBXdR_7xTX4yO0azOJegRVcA" alt="mercado" />
            </span>

            <span className="site-header__logo-text">
              Mercado Libre
            </span>
          </NavLink>

          {/* =========================
              DESKTOP NAVIGATION
          ========================= */}

          <nav className="desktop-nav">

            <NavLink
              to="/home"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Inicio
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Productos
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Pedidos
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Perfil
            </NavLink>

          </nav>

          {/* =========================
              RIGHT SIDE
          ========================= */}

          <div className="site-header__right">

            <button
              type="button"
              className="header-logout"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>

            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenuOpen(
                  (previous) => !previous
                )
              }
              aria-label="Alternar navegación"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>

          </div>

        </div>

        {/* =========================
            MOBILE NAVIGATION
        ========================= */}

        {mobileMenuOpen && (
          <nav className="mobile-nav">

            <NavLink
              to="/home"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
              onClick={closeMobileMenu}
            >
              Inicio
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
              onClick={closeMobileMenu}
            >
              Productos
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
              onClick={closeMobileMenu}
            >
              Pedidos
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "active" : ""
                }`
              }
              onClick={closeMobileMenu}
            >
              Perfil
            </NavLink>

            <button
              type="button"
              className="mobile-nav__logout"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>

          </nav>
        )}

      </header>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="site-main">
        <Outlet />
      </main>

    </div>
  );
}

export default UserLayout;