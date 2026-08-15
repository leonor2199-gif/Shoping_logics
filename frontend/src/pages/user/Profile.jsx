import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import userService from "../../services/userService";

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

function Profile() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingBank, setSavingBank] =
    useState(false);

  const [profileForm, setProfileForm] =
    useState({
      email: "",
    });

  const [bankForm, setBankForm] =
    useState({
      bankName: "",
      accountNumber: "",
      holderName: "",
      ifscCode: "",
      withdrawalPassword: "",
    });

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response =
        await userService.getProfile();

      const currentUser =
        response.user;

      setUser(currentUser);

      setProfileForm({
        email:
          currentUser.email || "",
      });

      setBankForm({
        bankName:
          currentUser.bankDetails
            ?.bankName || "",

        accountNumber:
          currentUser.bankDetails
            ?.accountNumber || "",

        holderName:
          currentUser.bankDetails
            ?.holderName || "",

        ifscCode:
          currentUser.bankDetails
            ?.ifscCode || "",

        withdrawalPassword: "",
      });
    } catch (error) {
      console.error(
        "Error al cargar el perfil:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Error al cargar el perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } =
      event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleBankChange = (event) => {
    const { name, value } =
      event.target;

    setBankForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSavingProfile(true);

      const response =
        await userService.updateProfile(
          {
            email:
              profileForm.email.trim() ||
              undefined,
          }
        );

      setUser(response.user);

      toast.success(
        "Perfil actualizado exitosamente."
      );
    } catch (error) {
      console.error(
        "Error al actualizar el perfil:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "No se pudo actualizar el perfil."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleBankSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !bankForm.bankName.trim() ||
      !bankForm.accountNumber.trim() ||
      !bankForm.holderName.trim()
    ) {
      toast.error(
        "Por favor completa todos los detalles bancarios requeridos."
      );

      return;
    }

    if (
      !bankForm.withdrawalPassword
    ) {
      toast.error(
        "La contraseña de retiro es requerida."
      );

      return;
    }

    try {
      setSavingBank(true);

      const response =
        await userService.updateBankDetails(
          {
            bankName:
              bankForm.bankName.trim(),

            accountNumber:
              bankForm.accountNumber.trim(),

            holderName:
              bankForm.holderName.trim(),

            ifscCode:
              bankForm.ifscCode.trim(),

            withdrawalPassword:
              bankForm.withdrawalPassword,
          }
        );

      setUser(response.user);

      setBankForm((previous) => ({
        ...previous,
        withdrawalPassword: "",
      }));

      toast.success(
        "Detalles bancarios actualizados."
      );
    } catch (error) {
      console.error(
        "Error al actualizar los detalles bancarios:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "No se pudieron actualizar los detalles bancarios."
      );
    } finally {
      setSavingBank(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Cargando perfil...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-message">
        No se pudo cargar el perfil.
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}

      <section className="profile-header">
        <div className="profile-header__info">
          <p>
            Mi Cuenta
          </p>

          <h1>
            {user.phone}
          </h1>

          <div className="profile-header__meta">
            <span>
              VIP {user.vipLevel}
            </span>

            <span
              className={`account-status account-status--${user.status}`}
            >
              {user.status === "active" ? "Activo" : user.status}
            </span>
          </div>
        </div>
      </section>

      {/* Financial summary */}

      <section className="profile-stats">
        <div className="profile-stat">
          <span>
            Saldo Actual
          </span>

          <strong>
            {formatMoney(
              user.balance
            )}
          </strong>
        </div>

        <div className="profile-stat">
          <span>
            Total Depositado
          </span>

          <strong>
            {formatMoney(
              user.totalDeposited
            )}
          </strong>
        </div>

        <div className="profile-stat">
          <span>
            Total Retirado
          </span>

          <strong>
            {formatMoney(
              user.totalWithdrawn
            )}
          </strong>
        </div>

        <div className="profile-stat">
          <span>
            Retiro Pendiente
          </span>

          <strong>
            {formatMoney(
              user.pendingWithdrawal
            )}
          </strong>
        </div>
      </section>

      <div className="profile-grid">
        {/* Personal information */}

        <section className="profile-card">
          <div className="profile-card__header">
            <div>
              <h2>
                Información Personal
              </h2>

              <p>
                Gestiona la información de tu cuenta.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              handleProfileSubmit
            }
          >
            <div className="profile-form-group">
              <label>
                Número de Teléfono
              </label>

              <input
                type="text"
                value={user.phone || ""}
                disabled
              />

              <small>
                El número de teléfono no se puede cambiar.
              </small>
            </div>

            <div className="profile-form-group">
              <label>
                Correo Electrónico
              </label>

              <input
                type="email"
                name="email"
                value={
                  profileForm.email
                }
                onChange={
                  handleProfileChange
                }
                placeholder="Ingresa tu correo electrónico"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                savingProfile
              }
            >
              {savingProfile
                ? "Guardando..."
                : "Guardar Perfil"}
            </button>
          </form>
        </section>

        {/* VIP */}

        <section className="profile-card">
          <div className="profile-card__header">
            <div>
              <h2>
                Nivel VIP
              </h2>

              <p>
                Tu nivel de membresía actual.
              </p>
            </div>

            <span className="vip-badge">
              VIP {user.vipLevel}
            </span>
          </div>

          <div className="vip-info">
            <div className="vip-info__icon">
              👑
            </div>

            <div>
              <strong>
                Nivel VIP {user.vipLevel}
              </strong>

              <p>
                Tus productos disponibles están
                determinados por tu nivel VIP.
              </p>
            </div>
          </div>

          <div className="account-info">
            <div>
              <span>
                Estado de la Cuenta
              </span>

              <strong>
                {user.status === "active" ? "Activo" : user.status}
              </strong>
            </div>

            <div>
              <span>
                Miembro Desde
              </span>

              <strong>
                {user.createdAt
                  ? new Date(
                      user.createdAt
                    ).toLocaleDateString()
                  : "-"}
              </strong>
            </div>
          </div>
        </section>

        {/* Bank details */}

        <section className="profile-card profile-card--full">
          <div className="profile-card__header">
            <div>
              <h2>
                Detalles Bancarios
              </h2>

              <p>
                Estos detalles se utilizan al
                procesar los retiros.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleBankSubmit}
          >
            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label>
                  Nombre del Banco
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="bankName"
                  value={
                    bankForm.bankName
                  }
                  onChange={
                    handleBankChange
                  }
                  placeholder="Nombre del banco"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  Número de Cuenta
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="accountNumber"
                  value={
                    bankForm.accountNumber
                  }
                  onChange={
                    handleBankChange
                  }
                  placeholder="Número de cuenta"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  Nombre del Titular
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="holderName"
                  value={
                    bankForm.holderName
                  }
                  onChange={
                    handleBankChange
                  }
                  placeholder="Nombre del titular"
                />
              </div>

              <div className="profile-form-group">
                <label>
                  Código IFSC
                </label>

                <input
                  type="text"
                  name="ifscCode"
                  value={
                    bankForm.ifscCode
                  }
                  onChange={
                    handleBankChange
                  }
                  placeholder="Código IFSC"
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>
                Contraseña de Retiro
                <span>*</span>
              </label>

              <input
                type="password"
                name="withdrawalPassword"
                value={
                  bankForm.withdrawalPassword
                }
                onChange={
                  handleBankChange
                }
                placeholder="Ingresa la contraseña de retiro"
              />

              <small>
                Requerida para guardar los datos bancarios.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingBank}
            >
              {savingBank
                ? "Guardando..."
                : "Guardar Datos Bancarios"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Profile;