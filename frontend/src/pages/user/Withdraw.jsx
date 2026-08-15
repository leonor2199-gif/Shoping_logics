import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import financeService from "../../services/financeService";
import userService from "../../services/userService";

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

const MIN_WITHDRAWAL_AMOUNT = 160;

function Withdraw() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [balance, setBalance] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [
    withdrawalPassword,
    setWithdrawalPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [eligibility, setEligibility] =
    useState(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        profileResponse,
        balanceResponse,
        eligibilityResponse,
      ] = await Promise.all([
        userService.getProfile(),
        financeService.getBalance(),
        financeService.getWithdrawalEligibility(),
      ]);

      setUser(
        profileResponse.user
      );

      setBalance(
        balanceResponse
      );

      setEligibility(
        eligibilityResponse?.eligibility || null
      );
    } catch (error) {
      console.error(
        "Error al cargar los datos de retiro:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "No se pudo cargar la información de retiro."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAmountChange = (
    event
  ) => {
    const value =
      event.target.value;

    if (value === "") {
      setAmount("");
      return;
    }

    if (
      Number(value) < 0
    ) {
      return;
    }

    setAmount(value);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      eligibility &&
      !eligibility.eligible
    ) {
      toast.error(
        `Completa todos los productos VIP requeridos primero: ${eligibility.completedCount}/${eligibility.requiredCount}.`
      );
      return;
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      toast.error(
        "Por favor ingresa un monto de retiro válido."
      );

      return;
    }

    const currentBalance =
      Number(
        balance?.balance || 0
      );

    const amountInMinorUnits =
      Math.round(
        numericAmount * 100
      );

    // Check available balance before the minimum
    // withdrawal rule so the user gets the correct
    // error when the requested amount exceeds balance.
    if (
      amountInMinorUnits >
      currentBalance
    ) {
      toast.error(
        "No tienes suficiente saldo disponible para realizar este retiro."
      );

      return;
    }

    if (numericAmount < MIN_WITHDRAWAL_AMOUNT) {
      toast.error(
        `El monto mínimo de retiro es $${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}.`
      );

      return;
    }

    if (
      !withdrawalPassword
    ) {
      toast.error(
        "Por favor ingresa tu contraseña de retiro."
      );

      return;
    }

    if (
      !/^\d{6,}$/.test(
        withdrawalPassword
      )
    ) {
      toast.error(
        "La contraseña de retiro debe contener al menos 6 dígitos."
      );

      return;
    }

    if (!user?.bankDetails?.bankName) {
      toast.error(
        "Por favor agrega tus datos bancarios antes de retirar."
      );

      return;
    }

    try {
      setSubmitting(true);

      await financeService.createWithdrawal(
        {
          amount:
            amountInMinorUnits,

          withdrawalPassword,
        }
      );

      toast.success(
        "Solicitud de retiro enviada exitosamente."
      );

      setAmount("");
      setWithdrawalPassword("");

      navigate("/transactions");
    } catch (error) {
      console.error(
        "Error al realizar el retiro:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "No se pudo enviar la solicitud de retiro."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="withdraw-loading">
        Cargando información de retiro...
      </div>
    );
  }

  const hasBankDetails =
    Boolean(
      user?.bankDetails?.bankName &&
      user?.bankDetails
        ?.accountNumber &&
      user?.bankDetails
        ?.holderName
    );

  return (
    <div className="withdraw-page">

      {/* Pending withdrawal */}

      {Number(
        balance?.pendingWithdrawal || 0
      ) > 0 && (
        <div className="withdraw-pending">
          <div className="withdraw-pending__icon">
            ⏳
          </div>

          <div>
            <strong>
              Retiro Pendiente
            </strong>

            <p>
              Actualmente tienes{" "}
              <b>
                {formatMoney(
                  balance.pendingWithdrawal
                )}
              </b>{" "}
              en retiros pendientes.
            </p>
          </div>
        </div>
      )}

      <div className="withdraw-layout">

        {/* Bank account */}

        <section className="withdraw-card">

          <div className="withdraw-card__header">
            <div>
              <h2>
                Cuenta de Retiro
              </h2>

              <p>
                Tu cuenta bancaria guardada.
              </p>
            </div>

            <Link
              to="/profile"
              className="withdraw-edit"
            >
              Editar
            </Link>
          </div>

          {hasBankDetails ? (
            <div className="withdraw-bank">

              <div className="withdraw-bank__details">

                <strong>
                  {
                    user.bankDetails
                      .bankName
                  }
                </strong>

                <div>
                  <span>
                    Número de Cuenta
                  </span>

                  <b>
                    {
                      user.bankDetails
                        .accountNumber
                    }
                  </b>
                </div>

                <div>
                  <span>
                    Titular de la Cuenta
                  </span>

                  <b>
                    {
                      user.bankDetails
                        .holderName
                    }
                  </b>
                </div>

                {user.bankDetails
                  .ifscCode && (
                  <div>
                    <span>
                      IFSC
                    </span>

                    <b>
                      {
                        user.bankDetails
                          .ifscCode
                      }
                    </b>
                  </div>
                )}

              </div>

              <span className="withdraw-bank__verified">
                ✓ 
              </span>

            </div>
          ) : (
            <div className="withdraw-no-bank">

              <div>
                🏦
              </div>

              <h3>
                No hay cuenta bancaria
              </h3>

              <p>
                Agrega tus datos bancarios antes
                de solicitar un retiro.
              </p>

              <Link
                to="/profile"
                className="btn btn-primary"
              >
                Agregar Datos Bancarios
              </Link>

            </div>
          )}

        </section>

        {/* Withdrawal Eligibility */}

        <section className="withdraw-card withdraw-eligibility-card">

          <div className="withdraw-card__header">
            <div>
              <h2>
                Elegibilidad para Retiro
              </h2>

              <p>
                Completa todos los productos asignados a tu nivel VIP antes de solicitar un retiro.
              </p>
            </div>

            <strong
              className={
                eligibility?.eligible
                  ? "withdraw-eligibility-status is-eligible"
                  : "withdraw-eligibility-status is-locked"
              }
            >
              {eligibility?.eligible
                ? "✓ Elegible"
                : "🔒 Bloqueado"}
            </strong>
          </div>

          {eligibility && (
            <>
              <div className="withdraw-eligibility-progress">
                <div className="withdraw-eligibility-progress__labels">
                  <span>
                    VIP {eligibility.vipLevel}
                  </span>

                  <strong>
                    {eligibility.completedCount} / {eligibility.requiredCount} completados
                  </strong>
                </div>

                <div className="withdraw-eligibility-progress__bar">
                  <span
                    style={{
                      width: `${Math.min(100, (eligibility.completedCount / eligibility.requiredCount) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {!eligibility.eligible && (
                <div className="withdraw-eligibility-warning">
                  <strong>
                    {eligibility.remainingCount} producto{eligibility.remainingCount === 1 ? "" : "s"} restante{eligibility.remainingCount === 1 ? "" : "s"}
                  </strong>

                  <p>
                    Completa los productos VIP {eligibility.vipLevel} restantes para desbloquear los retiros.
                  </p>

                  <Link
                    to="/products"
                    className="btn btn-primary withdraw-eligibility-products-link"
                  >
                    Ver Productos
                  </Link>
                </div>
              )}

              {eligibility.requiredProducts?.length > 0 && (
                <div className="withdraw-eligibility-products">
                  {eligibility.requiredProducts.map((item) => (
                    <div
                      key={String(item.id)}
                      className={
                        item.completed
                          ? "withdraw-eligibility-product is-complete"
                          : "withdraw-eligibility-product"
                      }
                    >
                      <span>
                        {item.completed ? "✓" : "○"}
                      </span>

                      <strong>
                        {item.name}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </section>

        {/* Form */}

        <section className="withdraw-card">

          <div className="withdraw-card__header">
            <div>
              <h2>
                Solicitud de Retiro
              </h2>

              <p>
                Ingresa el monto que deseas
                retirar.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
          >

            <div className="withdraw-form-group">

              <label>
                Monto a Retirar. !Mínimo 160!
              </label>

              <div className="withdraw-amount-input">

                <span>
                  $
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={
                    handleAmountChange
                  }
                  placeholder="0.00"
                  disabled={
                    !hasBankDetails ||
                    submitting
                  }
                />

              </div>

              <small>
                Disponible:{" "}
                <strong>
                  {formatMoney(
                    balance?.balance
                  )}
                </strong>
              </small>

            </div>

            {/* Quick amounts */}

            <div className="withdraw-quick">

              {[160, 200, 500].map(
                (quickAmount) => (
                  <button
                    type="button"
                    key={
                      quickAmount
                    }
                    onClick={() =>
                      setAmount(
                        String(
                          quickAmount
                        )
                      )
                    }
                    disabled={
                      !hasBankDetails ||
                      submitting
                    }
                  >
                    ${quickAmount}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  setAmount(
                    (
                      Number(
                        balance?.balance ||
                          0
                      ) / 100
                    ).toFixed(2)
                  )
                }
                disabled={
                  !hasBankDetails ||
                  submitting ||
                  !balance?.balance
                }
              >
                Máximo
              </button>

            </div>

            <div className="withdraw-form-group">

              <label>
                Contraseña de Retiro
              </label>

              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={
                  withdrawalPassword
                }
                onChange={(event) => {
                  const value =
                    event.target.value;

                  if (
                    /^\d*$/.test(
                      value
                    )
                  ) {
                    setWithdrawalPassword(
                      value
                    );
                  }
                }}
                placeholder="Ingresa la contraseña de retiro (6+ dígitos)"
                maxLength={32}
                disabled={
                  !hasBankDetails ||
                  submitting
                }
              />

              <small>
                Esta es tu contraseña de retiro,
                no tu contraseña de acceso.
              </small>

            </div>

            {/* Summary */}

            <div className="withdraw-summary">

              <div>
                <span>
                  Monto a Retirar
                </span>

                <strong>
                  $
                  {formatMoney(
                    Number(
                      amount || 0
                    ) * 100
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Saldo después del retiro
                </span>

                <strong>
                  $
                  {formatMoney(
                    Math.max(
                      0,
                      Number(
                        balance?.balance ||
                          0
                      ) -
                        Math.round(
                          Number(
                            amount || 0
                          ) *
                            100
                        )
                    )
                  )}
                </strong>
              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary withdraw-submit"
              disabled={
                submitting ||
                !hasBankDetails ||
                !amount ||
                !withdrawalPassword ||
                eligibility === null ||
                !eligibility.eligible
              }
            >
              {submitting
                ? "Enviando..."
                : "Enviar Solicitud de Retiro"}
            </button>

          </form>


        </section>

      </div>

      <div className="withdraw-footer">
        <Link to="/transactions">
          Ver historial de transacciones →
        </Link>
      </div>

    </div>
  );
}

export default Withdraw;