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

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

function Deposit() {
  const navigate = useNavigate();

  const [banks, setBanks] =
    useState([]);

  const [balance, setBalance] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [referenceNumber, setReferenceNumber] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [selectedBank, setSelectedBank] =
    useState(null);

  useEffect(() => {
    loadDepositData();
  }, []);

  const loadDepositData = async () => {
    try {
      setLoading(true);

      const [
        balanceResponse,
        banksResponse,
      ] = await Promise.all([
        financeService.getBalance(),
        financeService.getDepositBanks(),
      ]);

      setBalance(balanceResponse);

      const availableBanks =
        banksResponse.banks || [];

      setBanks(availableBanks);

      if (availableBanks.length > 0) {
        setSelectedBank(
          availableBanks[0]
        );
      }
    } catch (error) {
      console.error(
        "Error al cargar los datos de depósito:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "No se pudo cargar la información de depósito."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      toast.error(
        "Por favor ingresa un monto de depósito válido."
      );

      return;
    }

    if (!referenceNumber.trim()) {
      toast.error(
        "Por favor ingresa el número de referencia del pago."
      );

      return;
    }

    try {
      setSubmitting(true);

      /*
       * Backend stores money in minor units.
       * Example:
       * 100.00 -> 10000
       */

      const amountInMinorUnits =
        Math.round(
          numericAmount * 100
        );

      await financeService.createDeposit(
        {
          amount:
            amountInMinorUnits,

          referenceNumber:
            referenceNumber.trim(),
        }
      );

      toast.success(
        "Solicitud de depósito enviada exitosamente."
      );

      setAmount("");
      setReferenceNumber("");

      navigate("/transactions");
    } catch (error) {
      console.error(
        "Error al realizar el depósito:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "No se pudo enviar la solicitud de depósito."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="deposit-loading">
        Cargando información de depósito...
      </div>
    );
  }

  return (
    <div className="deposit-page">
      {/* Header */}

      <section className="deposit-header">
        <div>
          <p className="deposit-eyebrow">
            Financiación de Cuenta
          </p>

          <h1>
            Depositar Fondos
          </h1>

          <p>
            Transfiere fondos usando uno de los
            métodos de pago disponibles a continuación.
          </p>
        </div>

        <div className="deposit-balance">
          <span>
            Saldo Actual
          </span>

          <strong>
            {formatMoney(
              balance?.balance
            )}
          </strong>
        </div>
      </section>

      {/* Steps */}

      <section className="deposit-steps">
        <div className="deposit-step deposit-step--active">
          <span>1</span>

          <div>
            <strong>
              Realizar Pago
            </strong>

            <p>
              Transfiere dinero a la cuenta
              a continuación.
            </p>
          </div>
        </div>

        <div className="deposit-step">
          <span>2</span>

          <div>
            <strong>
              Enviar Referencia
            </strong>

            <p>
              Ingresa tu referencia de pago.
            </p>
          </div>
        </div>

        <div className="deposit-step">
          <span>3</span>

          <div>
            <strong>
              Esperar Aprobación
            </strong>

            <p>
              Tu depósito será revisado.
            </p>
          </div>
        </div>
      </section>

      <div className="deposit-layout">
        {/* Banks */}

        <section className="deposit-card">
          <div className="deposit-card__header">
            <div>
              <h2>
                Cuentas de Pago
              </h2>

              <p>
                Elige una cuenta para realizar
                tu pago.
              </p>
            </div>
          </div>

          {banks.length === 0 ? (
            <div className="deposit-empty">
              <span>🏦</span>

              <h3>
                No hay cuentas de pago disponibles
              </h3>

              <p>
                Por favor intenta de nuevo más tarde.
              </p>
            </div>
          ) : (
            <div className="bank-list">
              {banks.map((bank) => {
                const isSelected =
                  selectedBank?._id ===
                  bank._id;

                return (
                  <button
                    type="button"
                    key={bank._id}
                    className={`bank-card ${
                      isSelected
                        ? "bank-card--selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedBank(
                        bank
                      )
                    }
                  >
                    <div className="bank-card__icon">
                      🏦
                    </div>

                    <div className="bank-card__content">
                      <strong>
                        {bank.bankName}
                      </strong>

                      <div>
                        <span>
                          Número de Cuenta
                        </span>

                        <b>
                          {bank.accountNumber}
                        </b>
                      </div>

                      <div>
                        <span>
                          Titular de la Cuenta
                        </span>

                        <b>
                          {bank.holderName}
                        </b>
                      </div>

                      {bank.branch && (
                        <div>
                          <span>
                            Sucursal
                          </span>

                          <b>
                            {bank.branch}
                          </b>
                        </div>
                      )}

                      {bank.ifscCode && (
                        <div>
                          <span>
                            IFSC
                          </span>

                          <b>
                            {bank.ifscCode}
                          </b>
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="bank-card__check">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Deposit Form */}

        <section className="deposit-card">
          <div className="deposit-card__header">
            <div>
              <h2>
                Solicitud de Depósito
              </h2>

              <p>
                Envía los detalles de tu pago.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
          >
            <div className="deposit-form-group">
              <label>
                Monto a Depositar
              </label>

              <div className="amount-input">
                <span>
                  $
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                />
              </div>

              <small>
                Ingresa el monto exacto que
                transferiste.
              </small>
            </div>

            <div className="deposit-form-group">
              <label>
                Referencia de Pago
              </label>

              <input
                type="text"
                value={
                  referenceNumber
                }
                onChange={(event) =>
                  setReferenceNumber(
                    event.target.value
                  )
                }
                placeholder="Ingresa el número de transacción/referencia"
              />

              <small>
                Usa el número de referencia de
                tu comprobante de pago.
              </small>
            </div>

            {/* Selected bank summary */}

            {selectedBank && (
              <div className="selected-bank">
                <span>
                  Pagando a
                </span>

                <strong>
                  {selectedBank.bankName}
                </strong>

                <p>
                  {
                    selectedBank.accountNumber
                  }
                </p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary deposit-submit"
              disabled={
                submitting ||
                banks.length === 0
              }
            >
              {submitting
                ? "Enviando..."
                : "Enviar Solicitud de Depósito"}
            </button>
          </form>

          <div className="deposit-notice">
            <strong>
              Importante
            </strong>

            <p>
              Asegúrate de que tu referencia de pago
              sea correcta. Tu saldo se actualizará
              después de que el depósito sea
              revisado y aprobado.
            </p>
          </div>
        </section>
      </div>

      <div className="deposit-footer-link">
        <Link to="/transactions">
          Ver historial de transacciones →
        </Link>
      </div>
    </div>
  );
}

export default Deposit;