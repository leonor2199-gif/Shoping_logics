import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import productService from "../../services/productService";

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

function Products() {
  const navigate = useNavigate();

  const [product, setProduct] =
    useState(null);

  const [pendingOrder, setPendingOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadNextProduct =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await productService.getNextProduct();

        setProduct(
          response.product || null
        );

        setPendingOrder(
          response.pendingOrder || null
        );
      } catch (error) {
        console.error(
          "Error al cargar el siguiente producto:",
          error
        );

        setProduct(null);
        setPendingOrder(null);

        setError(
          error.response?.data?.message ||
            "No se pudo cargar tu siguiente producto."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadNextProduct();
  }, [loadNextProduct]);

  /*
   * Refresh when user returns to the Products page.
   * This catches stock changes made by other users.
   */
  useEffect(() => {
    const handleFocus =
      () => {
        loadNextProduct();
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadNextProduct]);

  const handleOpenProduct =
    () => {
      if (!product) {
        return;
      }

      navigate(
        `/products/${product._id}`
      );
    };

  const handleContinuePending =
    () => {
      if (!pendingOrder) {
        return;
      }

      navigate(
        `/orders/${pendingOrder._id}/confirm`
      );
    };

  if (loading) {
    return (
      <div className="products-page">
        <section className="products-page__header">
          <div>
            <p className="products-page__eyebrow">
              Mercado
            </p>

            <h1>
              Tu Siguiente Producto
            </h1>

            <p>
              Cargando tu siguiente producto disponible...
            </p>
          </div>
        </section>

        <div className="products-grid">
          <div className="product-skeleton">
            <div className="product-skeleton__image" />

            <div className="product-skeleton__content">
              <div className="product-skeleton__line product-skeleton__line--small" />

              <div className="product-skeleton__line" />

              <div className="product-skeleton__line product-skeleton__line--short" />

              <div className="product-skeleton__footer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <section className="products-page__header">
          <div>
            <p className="products-page__eyebrow">
              Mercado
            </p>

            <h1>
              Tu Siguiente Producto
            </h1>

            <p>
              Algo salió mal al cargar tu producto.
            </p>
          </div>
        </section>

        <div className="products-message products-message--error">
          <strong>
            No se pudo cargar el producto
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={
              loadNextProduct
            }
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  /*
   * Pending order always takes priority.
   */
  if (pendingOrder) {
    return (
      <div className="products-page">
        <section className="products-page__header">
          <div>
            <p className="products-page__eyebrow">
              Pedido Actual
            </p>

            <h1>
              Completa tu Pedido Actual
            </h1>

            <p>
              Ya tienes un producto pendiente.
              Complétalo antes de continuar.
            </p>
          </div>
        </section>

        <div className="products-message">
          <div className="products-message__icon">
            📦
          </div>

          <h2>
            {pendingOrder.productName}
          </h2>

          <p>
            Pedido #{pendingOrder.orderNumber}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={
              handleContinuePending
            }
          >
            Continuar Pedido
          </button>
        </div>
      </div>
    );
  }

  /*
   * The backend already skips:
   * - wrong VIP
   * - inactive products
   * - zero stock
   * - previously accepted products
   *
   * Therefore the frontend receives only ONE
   * eligible product.
   */
  if (!product) {
    return (
      <div className="products-page">
        <section className="products-page__header">
          <div>
            <p className="products-page__eyebrow">
              Mercado
            </p>

            <h1>
              No hay más productos
            </h1>

            <p>
              Actualmente no hay más productos
              disponibles para tu nivel VIP.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const totalAmount =
    Number(
      product.basePrice || 0
    ) +
    Number(
      product.cashbackBonus || 0
    );

  return (
    <div className="products-page">

      <div className="products-grid">
        <article
          className="product-card"
          onClick={
            handleOpenProduct
          }
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              handleOpenProduct();
            }
          }}
        >
          <div className="product-card__image">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
              />
            ) : (
              <div className="product-card__placeholder">
                🛍️
              </div>
            )}
          </div>

          <div className="product-card__content">
            <div className="product-card__badges">
              <span>
                {product.category ||
                  "General"}
              </span>

              <span>
                VIP {product.minVipLevel}
              </span>
            </div>

            <h2>
              {product.name}
            </h2>

            <p>
              {product.description}
            </p>

            <div className="product-card__price">
              <strong>Precio: 
                {formatMoney(
                  product.basePrice
                )}
              </strong>
            </div>

            <div className="product-card__cashback">
              Comisión +
              {formatMoney(
                product.cashbackBonus
              )}
            </div>



            <button
              type="button"
              className="btn btn-primary"
              onClick={(event) => {
                event.stopPropagation();
                handleOpenProduct();
              }}
            >
              Ver Producto
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

export default Products;