import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import orderService from "../../services/orderService";
import productService from "../../services/productService";

import { useBalance } from "../../context/BalanceContext";

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    refreshBalance,
  } = useBalance();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [confirming, setConfirming] =
    useState(false);

  const [error, setError] =
    useState("");

  const [nextProduct, setNextProduct] =
    useState(null);

  useEffect(() => {
    let mounted = true;

    const loadOrder =
      async () => {
        try {
          setLoading(true);
          setError("");

          let foundOrder = null;

          /*
           * Prefer the direct endpoint.
           */
          try {
            const response =
              await orderService.getOrder(id);

            foundOrder =
              response.order || null;
          } catch (directError) {
            /*
             * Backward-compatible fallback for
             * backends that do not expose GET /orders/:id.
             */
            const response =
              await orderService.getMyOrders({
                page: 1,
                limit: 100,
              });

            foundOrder =
              response.orders?.find(
                (item) =>
                  String(item._id) ===
                  String(id)
              ) || null;
          }

          if (!foundOrder) {
            throw new Error(
              "Pedido no encontrado."
            );
          }

          if (mounted) {
            setOrder(foundOrder);
          }
        } catch (error) {
          console.error(
            "Error al cargar el pedido:",
            error
          );

          if (mounted) {
            setError(
              error.response?.data?.message ||
                error.message ||
                "No se pudo cargar el pedido."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleConfirm =
    async () => {
      if (!order || confirming) {
        return;
      }

      if (
        order.status !==
        "pending"
      ) {
        toast.error(
          "Este pedido ya no está pendiente."
        );

        return;
      }

      try {
        setConfirming(true);

        const response =
          await orderService.confirmOrder(
            order._id
          );

        const confirmedOrder =
          response.order || {
            ...order,
            status: "confirmed",
          };

        setOrder(
          confirmedOrder
        );

        /*
         * Balance is deducted by the backend
         * transaction. Refresh the live balance
         * immediately after success.
         */
        await refreshBalance();

        /*
         * Ask the backend for the next product.
         * It will skip:
         * - wrong VIP
         * - zero stock
         * - already accepted products
         */
        try {
          const nextResponse =
            await productService.getNextProduct();

          setNextProduct(
            nextResponse?.product ||
              null
          );
        } catch (nextError) {
          console.error(
            "Error al cargar el siguiente producto:",
            nextError
          );

          setNextProduct(null);
        }

        toast.success(
          "¡Pedido confirmado exitosamente!"
        );
      } catch (error) {
        console.error(
          "Error al confirmar el pedido:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "No se pudo confirmar el pedido."
        );
      } finally {
        setConfirming(false);
      }
    };

  const handleCancel =
    async () => {
      if (
        !order ||
        confirming ||
        order.status !==
          "pending"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "¿Cancelar este pedido pendiente?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setConfirming(true);

        const response =
          await orderService.cancelOrder(
            order._id
          );

        setOrder(
          response.order || {
            ...order,
            status: "cancelled",
          }
        );

        toast.success(
          "Pedido cancelado."
        );

        navigate(
          "/products",
          { replace: true }
        );
      } catch (error) {
        console.error(
          "Error al cancelar el pedido:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "No se pudo cancelar el pedido."
        );
      } finally {
        setConfirming(false);
      }
    };

  if (loading) {
    return (
      <div className="order-confirmation-loading">
        Cargando pedido...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-message">
        <div>
          ⚠️
        </div>

        <h2>
          Pedido no disponible
        </h2>

        <p>
          {error ||
            "Este pedido no pudo ser encontrado."}
        </p>

        <Link
          to="/products"
          className="btn btn-primary"
        >
          Volver a Productos
        </Link>
      </div>
    );
  }

  const isConfirmed =
    order.status ===
      "confirmed" ||
    order.status ===
      "completed";

  const isCancelled =
    order.status ===
    "cancelled";

  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation__header">
        <p>
          Confirmación de Pedido
        </p>

        <h1>
          Revisa tu pedido
        </h1>

        <span>
          Pedido #{order.orderNumber}
        </span>
      </div>

      <section className="order-confirmation-card">
        <div className="order-confirmation-product">
          <div className="order-confirmation-product__icon">
            🛍️
          </div>

          <div>
            <span>
              Producto
            </span>

            <strong>
              {order.productName}
            </strong>
          </div>
        </div>

        <div className="order-confirmation-row">
          <span>
            Cantidad
          </span>

          <strong>
            {order.quantity}
          </strong>
        </div>
      </section>

      <section className="order-confirmation-card">
        <h2>
          Resumen de Pago
        </h2>

        <div className="order-confirmation-row">
          <span>
            Precio del producto
          </span>

          <strong>
            {formatMoney(
              Number(
                order.basePrice || 0
              ) *
                Number(
                  order.quantity || 1
                )
            )}
          </strong>
        </div>

        <div className="order-confirmation-row">
          <span>
            Cashback
          </span>

          <strong className="order-cashback">
            +
            {formatMoney(
              Number(
                order.cashbackBonus || 0
              ) *
                Number(
                  order.quantity || 1
                )
            )}
          </strong>
        </div>

        <div className="order-confirmation-total">
          <span>
            Total
          </span>

          <strong>
            {formatMoney(
              order.totalAmount
            )}
          </strong>
        </div>
      </section>

      {isConfirmed ? (
        <section className="order-success">
          <div className="order-success__icon">
            ✓
          </div>

          <h2>
            Pedido Confirmado
          </h2>

          <p>
            Tu pedido ha sido confirmado exitosamente
            y la transacción de saldo ha sido procesada.
          </p>

          {nextProduct ? (
            <p>
              Tu siguiente producto ya está disponible.
            </p>
          ) : (
            <p>
              Actualmente no hay más productos elegibles
              disponibles para tu nivel VIP.
            </p>
          )}

          <div className="order-success__actions">
            {nextProduct ? (
              <Link
                to={`/products/${nextProduct._id}`}
                className="btn btn-primary"
              >
                Continuar al Siguiente Producto
              </Link>
            ) : (
              <Link
                to="/products"
                className="btn btn-primary"
              >
                Ver Productos
              </Link>
            )}

            <Link
              to="/orders"
              className="btn"
            >
              Ver Pedidos
            </Link>
          </div>
        </section>
      ) : isCancelled ? (
        <section className="order-confirm-action">
          <div>
            <strong>
              Pedido Cancelado
            </strong>

            <p>
              Este pedido ya no está activo.
            </p>
          </div>

          <Link
            to="/products"
            className="btn btn-primary"
          >
            Volver a Productos
          </Link>
        </section>
      ) : (
        <section className="order-confirm-action">

          <div className="order-confirm-action__buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={
                handleConfirm
              }
              disabled={
                confirming
              }
            >
              {confirming
                ? "Procesando..."
                : "Confirmar Pedido"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default OrderConfirmation;