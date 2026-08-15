import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import orderService from "../../services/orderService";

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(
    date
  ).toLocaleString();
}

function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "Pendiente";

    case "confirmed":
      return "Confirmado";

    case "completed":
      return "Completado";

    case "cancelled":
      return "Cancelado";

    default:
      return status || "Desconocido";
  }
}

function Orders() {
  const navigate =
    useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadOrders =
    useCallback(
      async (page = 1) => {
        try {
          setLoading(true);
          setError("");

          const response =
            await orderService.getMyOrders({
              page,
              limit: 10,
            });

          setOrders(
            response.orders || []
          );

          setPagination(
            response.pagination || {
              page,
              limit: 10,
              total: 0,
              pages: 0,
            }
          );
        } catch (error) {
          console.error(
            "Error al cargar los pedidos:",
            error
          );

          setError(
            error.response?.data?.message ||
              "No se pudieron cargar los pedidos."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  /*
   * Refresh orders when the user comes back
   * to the browser tab.
   */
  useEffect(() => {
    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          loadOrders(
            pagination.page || 1
          );
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    loadOrders,
    pagination.page,
  ]);

  const handleViewPendingOrder =
    (order) => {
      navigate(
        `/orders/${order._id}/confirm`
      );
    };

  return (
    <div className="orders-page">
      <section className="orders-page__header">
        <div>
          <p className="orders-page__eyebrow">
            Cuenta
          </p>

          <h1>
            Mis Pedidos
          </h1>

          <p>
            Realiza un seguimiento de tus compras y el estado de tus pedidos.
          </p>
        </div>

        <Link
          to="/products"
          className="btn btn-primary"
        >
          Explorar Productos
        </Link>
      </section>

      {error && (
        <div className="orders-message orders-message--error">
          <strong>
            No se pudieron cargar los pedidos
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              loadOrders(
                pagination.page || 1
              )
            }
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {loading && (
        <div className="orders-list">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              className="order-skeleton"
              key={index}
            >
              <div className="order-skeleton__top" />

              <div className="order-skeleton__line" />

              <div className="order-skeleton__line order-skeleton__line--short" />

              <div className="order-skeleton__bottom" />
            </div>
          ))}
        </div>
      )}

      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="orders-message">
            <div className="orders-message__icon">
              📦
            </div>

            <h2>
              Aún no hay pedidos
            </h2>

            <p>
              Aún no has realizado ningún pedido.
            </p>

            <Link
              to="/products"
              className="btn btn-primary"
            >
              Comenzar a Comprar
            </Link>
          </div>
        )}

      {!loading &&
        !error &&
        orders.length > 0 && (
          <>
            <div className="orders-list">
              {orders.map((order) => {
                const isPending =
                  order.status ===
                  "pending";

                const quantity =
                  Number(
                    order.quantity || 1
                  );

                const total =
                  Number(
                    order.totalAmount || 0
                  );

                const cashback =
                  Number(
                    order.cashbackBonus || 0
                  ) *
                  quantity;

                return (
                  <article
                    className={`order-card ${
                      isPending
                        ? "order-card--pending"
                        : ""
                    }`}
                    key={order._id}
                  >
                    <div className="order-card__top">
                      <div>
                        <span className="order-card__label">
                          Pedido
                        </span>

                        <strong>
                          #
                          {order.orderNumber}
                        </strong>
                      </div>

                      <span
                        className={`order-status order-status--${order.status}`}
                      >
                        {getStatusLabel(
                          order.status
                        )}
                      </span>
                    </div>

                    <div className="order-card__product">
                      <div className="order-card__icon">
                        🛍️
                      </div>

                      <div>
                        <strong>
                          {order.productName}
                        </strong>

                        <span>
                          Cantidad:{" "}
                          {quantity}
                        </span>
                      </div>
                    </div>

                    <div className="order-card__financial">
                      <div>
                        <span>
                          Precio del Producto
                        </span>

                        <strong>
                          {formatMoney(
                            Number(
                              order.basePrice ||
                                0
                            ) *
                              quantity
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Comisión
                        </span>

                        <strong className="order-card__cashback">
                          +
                          {formatMoney(
                            cashback
                          )}
                        </strong>
                      </div>

                      <div className="order-card__total">
                        <span>
                          Total
                        </span>

                        <strong>
                          {formatMoney(
                            total
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="order-card__bottom">
                      <span>
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                      {isPending ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            handleViewPendingOrder(
                              order
                            )
                          }
                        >
                          Continuar Pedido
                        </button>
                      ) : (
                        <span className="order-card__status-text">
                          {getStatusLabel(
                            order.status
                          )}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {pagination.pages > 1 && (
              <div className="orders-pagination">
                <button
                  type="button"
                  className="pagination-button"
                  disabled={
                    pagination.page <= 1
                  }
                  onClick={() =>
                    loadOrders(
                      pagination.page -
                        1
                    )
                  }
                >
                  Anterior
                </button>

                <span>
                  Página{" "}
                  <strong>
                    {pagination.page}
                  </strong>{" "}
                  de{" "}
                  <strong>
                    {pagination.pages}
                  </strong>
                </span>

                <button
                  type="button"
                  className="pagination-button"
                  disabled={
                    pagination.page >=
                    pagination.pages
                  }
                  onClick={() =>
                    loadOrders(
                      pagination.page +
                        1
                    )
                  }
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
    </div>
  );
}

export default Orders;