import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("==============================");
    console.log("USER LOGIN CLICKED");
    console.log("Phone:", phone);
    console.log("==============================");

    // Clear previous error message
    setErrorMessage("");

    if (!phone.trim()) {
      setErrorMessage("Por favor ingresa tu número de teléfono.");
      return;
    }

    if (!password) {
      setErrorMessage("Por favor ingresa tu contraseña.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/user/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone: phone.trim(),
            password,
          }),
        }
      );

      console.log(
        "User login backend status:",
        response.status
      );

      const data = await response.json();

      console.log(
        "User login backend response:",
        data
      );

      if (!response.ok) {
        // Show error message on the page
        const errorMsg = data.message || "Número de teléfono o contraseña incorrectos.";
        setErrorMessage(errorMsg);
        setLoading(false);
        return;
      }

      if (!data.token) {
        setErrorMessage("El backend no devolvió un token de usuario.");
        setLoading(false);
        return;
      }

      /*
       * IMPORTANT:
       *
       * Only create/update the USER session.
       *
       * DO NOT remove adminToken.
       * DO NOT remove admin.
       */

      localStorage.setItem(
        "userToken",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(
        "USER TOKEN SAVED"
      );

      console.log(
        "User token exists:",
        Boolean(
          localStorage.getItem("userToken")
        )
      );

      console.log(
        "Admin token still exists:",
        Boolean(
          localStorage.getItem("adminToken")
        )
      );

      toast.success(
        "¡Inicio de sesión exitoso!"
      );

      navigate("/home", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "USER LOGIN FAILED:",
        error
      );

      setErrorMessage("Número de teléfono o contraseña incorrectos.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>
            WELCOME
          </h1>

          <p>
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="phone">
              Número de teléfono
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setErrorMessage(""); // Clear error when user types
              }}
              placeholder="Ingresa tu número de teléfono"
              autoComplete="tel"
              disabled={loading}
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage(""); // Clear error when user types
              }}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              disabled={loading}
            />

          </div>

          {/* Error message displayed above the button */}
          {errorMessage && (
            <div className="error-message" style={{ 
              color: "#dc3545", 
              fontSize: "14px", 
              marginBottom: "12px",
              padding: "8px 12px",
              backgroundColor: "#f8d7da",
              borderRadius: "4px",
              border: "1px solid #f5c6cb",
              textAlign: "center"
            }}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </button>

        </form>

        <div className="auth-links">

          <Link to="/register">
            No tienes una cuenta? Regístrate
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;
