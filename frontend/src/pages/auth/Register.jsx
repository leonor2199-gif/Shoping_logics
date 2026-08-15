import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    phone: "",
    email: "",
    loginPassword: "",
    confirmLoginPassword: "",
    withdrawalPassword: "",
    confirmWithdrawalPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user types
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateLoginPassword = (password) => {
    if (password.length < 6) {
      return "La contraseña de acceso debe tener al menos 6 caracteres.";
    }

    if (!/^[a-z0-9]+$/.test(password)) {
      return "La contraseña de acceso solo puede contener letras minúsculas y números.";
    }

    if (!/[a-z]/.test(password)) {
      return "La contraseña de acceso debe contener al menos una letra minúscula.";
    }

    if (!/\d/.test(password)) {
      return "La contraseña de acceso debe contener al menos un número.";
    }

    return null;
  };

  const validateWithdrawalPassword = (password) => {
    if (password.length < 6) {
      return "La contraseña de retiro debe tener al menos 6 dígitos.";
    }

    if (!/^\d+$/.test(password)) {
      return "La contraseña de retiro solo puede contener números.";
    }

    return null;
  };

  const getLoginPasswordStrength = (password) => {
    if (!password) {
      return "";
    }

    const error = validateLoginPassword(password);

    if (!error) {
      return "strong";
    }

    if (password.length >= 6) {
      return "medium";
    }

    return "weak";
  };

  const passwordStrength = getLoginPasswordStrength(
    form.loginPassword
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous error message
    setErrorMessage("");

    if (!form.phone.trim()) {
      setErrorMessage("Por favor ingresa tu número de teléfono.");
      return;
    }

    if (!form.loginPassword) {
      setErrorMessage("Por favor ingresa una contraseña de acceso.");
      return;
    }

    if (!form.withdrawalPassword) {
      setErrorMessage("Por favor ingresa una contraseña de retiro.");
      return;
    }

    const loginPasswordError = validateLoginPassword(
      form.loginPassword
    );

    if (loginPasswordError) {
      setErrorMessage(loginPasswordError);
      return;
    }

    const withdrawalPasswordError =
      validateWithdrawalPassword(
        form.withdrawalPassword
      );

    if (withdrawalPasswordError) {
      setErrorMessage(withdrawalPasswordError);
      return;
    }

    if (
      form.loginPassword !==
      form.confirmLoginPassword
    ) {
      setErrorMessage("Las contraseñas de acceso no coinciden.");
      return;
    }

    if (
      form.withdrawalPassword !==
      form.confirmWithdrawalPassword
    ) {
      setErrorMessage("Las contraseñas de retiro no coinciden.");
      return;
    }

    if (
      form.loginPassword ===
      form.withdrawalPassword
    ) {
      setErrorMessage(
        "La contraseña de acceso y de retiro deben ser diferentes."
      );
      return;
    }

    if (!form.terms) {
      setErrorMessage(
        "Por favor acepta los términos y condiciones."
      );
      return;
    }

    try {
      setLoading(true);

      await register({
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        loginPassword: form.loginPassword,
        withdrawalPassword: form.withdrawalPassword,
      });

      toast.success(
        "¡Cuenta creada exitosamente!"
      );

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
      // Check if error is because user already exists
      const errorMsg = error.response?.data?.message || 
                       "Error al registrarse. Por favor intenta de nuevo.";
      
      // Display error on the page
      setErrorMessage(errorMsg);
      
      // Also show toast for additional visibility if needed
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-card auth-card--register">
        <div className="auth-card__header">
          <h1>Crear cuenta</h1>

          <p>
            Registra tu cuenta para comenzar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          {/* Phone */}

          <div className="form-group">
            <label htmlFor="phone">
              Número de teléfono{" "}
              <span className="required">*</span>
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+52..."
              autoComplete="tel"
            />
          </div>

          {/* Email */}

          <div className="form-group">
            <label htmlFor="email">
              Correo electrónico{" "}
              <span className="optional">
                (Opcional)
              </span>
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@ejemplo.com"
              autoComplete="email"
            />
          </div>

          {/* Login Password */}

          <div className="form-group">
            <label htmlFor="loginPassword">
              Contraseña de acceso{" "}
              <span className="required">*</span>
            </label>

            <input
              id="loginPassword"
              name="loginPassword"
              type="password"
              value={form.loginPassword}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />

            <small>
              Usa al menos 6 caracteres con letras minúsculas y números únicamente.
            </small>

            {form.loginPassword && (
              <div className="password-strength">
                <div className="password-strength__label">
                  Fortaleza de la contraseña:{" "}
                  <strong>
                    {passwordStrength === "strong" ? "fuerte" : 
                     passwordStrength === "medium" ? "media" : 
                     passwordStrength === "weak" ? "débil" : ""}
                  </strong>
                </div>

                <div className="password-strength__bar">
                  <span
                    className={`password-strength__fill password-strength__fill--${passwordStrength}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Login Password */}

          <div className="form-group">
            <label htmlFor="confirmLoginPassword">
              Confirmar contraseña de acceso{" "}
              <span className="required">*</span>
            </label>

            <input
              id="confirmLoginPassword"
              name="confirmLoginPassword"
              type="password"
              value={form.confirmLoginPassword}
              onChange={handleChange}
              placeholder="Confirmar contraseña de acceso"
              autoComplete="new-password"
            />
          </div>

          {/* Divider */}

          <div className="form-divider">
            <span>
              Seguridad de retiros
            </span>
          </div>

          {/* Withdrawal Password */}

          <div className="form-group">
            <label htmlFor="withdrawalPassword">
              Contraseña de retiro{" "}
              <span className="required">*</span>
            </label>

            <input
              id="withdrawalPassword"
              name="withdrawalPassword"
              type="password"
              inputMode="numeric"
              value={form.withdrawalPassword}
              onChange={handleChange}
              placeholder="Mínimo 6 dígitos"
              autoComplete="new-password"
            />

            <small>
              Usa al menos 6 dígitos. Solo números.
            </small>
          </div>

          {/* Confirm Withdrawal Password */}

          <div className="form-group">
            <label htmlFor="confirmWithdrawalPassword">
              Confirmar contraseña de retiro{" "}
              <span className="required">*</span>
            </label>

            <input
              id="confirmWithdrawalPassword"
              name="confirmWithdrawalPassword"
              type="password"
              inputMode="numeric"
              value={
                form.confirmWithdrawalPassword
              }
              onChange={handleChange}
              placeholder="Confirmar contraseña de retiro"
              autoComplete="new-password"
            />
          </div>

          {/* Terms */}

          <label className="checkbox-group">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
            />

            <span>
              Acepto los términos y condiciones.
            </span>
          </label>

          {/* Error message displayed above the submit button */}
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

          {/* Submit */}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading
              ? "Creando cuenta..."
              : "Crear cuenta"}
          </button>
        </form>

        <div className="auth-card__footer">
          <p>
            Ya tienes una cuenta?{" "}
            <Link to="/login">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;