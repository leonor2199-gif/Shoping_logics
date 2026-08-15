import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("==============================");
    console.log("ADMIN LOGIN CLICKED");
    console.log("Username:", username);
    console.log("==============================");

    if (!username.trim()) {
      toast.error("Please enter username.");
      return;
    }

    if (!password) {
      toast.error("Please enter password.");
      return;
    }

    try {
      setLoading(true);

      console.log(
        "Sending admin login request..."
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/admin/login`
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      console.log(
        "Backend status:",
        response.status
      );

      const data = await response.json();

      console.log(
        "Backend response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Admin login failed."
        );
      }

      if (!data.token) {
        throw new Error(
          "Backend did not return an admin token."
        );
      }

      /*
       * IMPORTANT:
       *
       * Only create/update the ADMIN session.
       *
       * DO NOT remove userToken.
       * DO NOT remove user.
       */

      localStorage.setItem(
        "adminToken",
        data.token
      );

      localStorage.setItem(
        "admin",
        JSON.stringify(data.admin)
      );

      console.log(
        "ADMIN TOKEN SAVED"
      );

      console.log(
        "Admin token exists:",
        Boolean(
          localStorage.getItem("adminToken")
        )
      );

      console.log(
        "User token still exists:",
        Boolean(
          localStorage.getItem("userToken")
        )
      );

      toast.success(
        "Admin login successful!"
      );

      navigate("/admin", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "ADMIN LOGIN FAILED:",
        error
      );

      toast.error(
        error.message ||
          "Unable to login."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-logo">
          A
        </div>

        <div className="admin-login-header">

          <h1>
            Admin Login
          </h1>

          <p>
            Sign in to access the
            administration panel.
          </p>

        </div>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-login-field">

            <label htmlFor="admin-username">
              Username
            </label>

            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              placeholder="Enter username"
              autoComplete="username"
              disabled={loading}
            />

          </div>

          <div className="admin-login-field">

            <label htmlFor="admin-password">
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={loading}
            />

          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        <div className="admin-login-footer">
          ProductShop Administration
        </div>

      </div>

    </div>
  );
}

export default AdminLogin;
