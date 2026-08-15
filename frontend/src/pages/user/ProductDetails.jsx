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

import productService from "../../services/productService";
import orderService from "../../services/orderService";
import userService from "../../services/userService";

import {
  useBalance,
} from "../../context/BalanceContext";


function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}


function ProductDetails() {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const {
    balance: contextBalance,
    refreshBalance,
  } = useBalance();


  const [
    product,
    setProduct,
  ] = useState(null);


  const [
    balance,
    setBalance,
  ] = useState(
    Number(
      contextBalance || 0
    )
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    ordering,
    setOrdering,
  ] = useState(false);


  const [
    showDepositModal,
    setShowDepositModal,
  ] = useState(false);


  const [
    depositAmount,
    setDepositAmount,
  ] = useState(0);


  const [
    error,
    setError,
  ] = useState("");


  /*
   * --------------------------------------------------------
   * LOAD LIVE BALANCE
   * --------------------------------------------------------
   */

  useEffect(() => {

    let mounted = true;


    async function loadBalance() {

      try {

        const response =
          await userService.getProfile();


        if (
          mounted &&
          response?.user
        ) {

          setBalance(
            Number(
              response.user.balance || 0
            )
          );
        }

      } catch (error) {

        console.error(
          "Error al cargar el saldo:",
          error
        );


        if (
          mounted
        ) {

          setBalance(
            Number(
              contextBalance || 0
            )
          );
        }
      }
    }


    loadBalance();


    return () => {
      mounted = false;
    };

  }, [contextBalance]);


  /*
   * --------------------------------------------------------
   * LOAD PRODUCT
   * --------------------------------------------------------
   */

  useEffect(() => {

    let mounted = true;


    async function loadProduct() {

      try {

        setLoading(true);
        setError("");


        /*
         * IMPORTANT:
         *
         * Get the normal product for
         * displaying the page.
         */

        const response =
          await productService.getProduct(
            id
          );


        if (
          mounted
        ) {

          setProduct(
            response.product
          );
        }

      } catch (error) {

        console.error(
          "Error al cargar el producto:",
          error
        );


        if (
          mounted
        ) {

          setError(
            error.response?.data?.message ||
            "No se pudo cargar el producto."
          );
        }

      } finally {

        if (
          mounted
        ) {

          setLoading(false);
        }
      }
    }


    loadProduct();


    return () => {
      mounted = false;
    };

  }, [id]);


  /*
   * --------------------------------------------------------
   * KEEP BALANCE SYNCHRONIZED
   * --------------------------------------------------------
   */

  useEffect(() => {

    if (
      contextBalance !== undefined &&
      contextBalance !== null
    ) {

      setBalance(
        Number(
          contextBalance || 0
        )
      );
    }

  }, [contextBalance]);


  /*
   * --------------------------------------------------------
   * LOADING
   * --------------------------------------------------------
   */

  if (loading) {

    return (
      <div className="product-details-loading">
        Cargando producto...
      </div>
    );
  }


  /*
   * --------------------------------------------------------
   * ERROR
   * --------------------------------------------------------
   */

  if (
    !product ||
    error
  ) {

    return (
      <div className="product-details-message">

        <h2>
          Producto no disponible
        </h2>

        <p>
          {error ||
            "Este producto no está disponible."}
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


  /*
   * --------------------------------------------------------
   * PRODUCT VALUES
   * --------------------------------------------------------
   */

  const productPrice =
    Number(
      product.basePrice || 0
    );


  const cashback =
    Number(
      product.cashbackBonus || 0
    );


  /*
   * Display total.
   *
   * Example:
   *
   * Price = 100
   * Cashback = 10
   * Total = 110
   */

  const totalAmount =
    productPrice +
    cashback;


  /*
   * IMPORTANT:
   *
   * User only needs the PRODUCT PRICE
   * in their balance.
   *
   * Cashback is received after
   * confirmation.
   */

  const requiredBalance =
    productPrice;


  const stock =
    Number(
      product.stockQuantity || 0
    );


  const outOfStock =
    stock <= 0;


  const insufficientBalance =
    Number(balance || 0) <
    requiredBalance;


  /*
   * --------------------------------------------------------
   * ACCEPT PRODUCT
   * --------------------------------------------------------
   */

  async function handleOrder() {

    if (
      ordering
    ) {
      return;
    }


    if (
      !product
    ) {
      return;
    }


    /*
     * Stock check.
     */

    if (
      outOfStock
    ) {

      toast.error(
        "Este producto está agotado."
      );

      return;
    }


    /*
     * Balance check.
     *
     * ONLY product price.
     */

    if (
      insufficientBalance
    ) {

      const requiredDeposit =
        Math.max(
          0,
          requiredBalance -
            Number(balance || 0)
        );


      setDepositAmount(
        requiredDeposit
      );

      setShowDepositModal(
        true
      );

      return;
    }


    try {

      setOrdering(true);


      /*
       * IMPORTANT:
       *
       * Only send productId.
       *
       * Backend forces quantity = 1.
       */

      const response =
        await orderService.createOrder({
          productId:
            product._id,
        });


      if (
        !response?.order?._id
      ) {

        throw new Error(
          "El pedido no fue creado."
        );
      }


      toast.success(
        "Producto aceptado exitosamente."
      );


      navigate(
        `/orders/${response.order._id}/confirm`
      );

    } catch (error) {

      console.error(
        "Error al crear el pedido:",
        error
      );


      const message =
        error.response?.data?.message ||
        error.message ||
        "No se pudo aceptar este producto.";


      toast.error(
        message
      );


      /*
       * Refresh balance if necessary.
       */

      if (
        /saldo insuficiente/i.test(
          message
        )
      ) {

        try {

          const profile =
            await userService.getProfile();


          if (
            profile?.user
          ) {

            setBalance(
              Number(
                profile.user.balance || 0
              )
            );
          }


          if (
            refreshBalance
          ) {

            await refreshBalance();
          }

        } catch (
          refreshError
        ) {

          console.error(
            "Error al actualizar el saldo:",
            refreshError
          );
        }
      }

    } finally {

      setOrdering(false);
    }
  }


  /*
   * --------------------------------------------------------
   * UI
   * --------------------------------------------------------
   */

  return (
    <div className="product-details-page">

      <Link
        to="/products"
        className="product-details-back"
      >
        ← Volver a Productos
      </Link>


      <section className="product-details">


        {/* IMAGE */}

        <div className="product-details__image">

          {product.image ? (

            <img
              src={product.image}
              alt={product.name}
            />

          ) : (

            <div className="product-details__placeholder">
              🛍️
            </div>

          )}

        </div>


        {/* CONTENT */}

        <div className="product-details__content">


          {/* BADGES */}

          <div className="product-details__badges">

            <span>
              VIP {product.minVipLevel}
            </span>

            <span>
              {product.category}
            </span>

          </div>


          {/* NAME */}

          <h1>
            {product.name}
          </h1>


          {/* DESCRIPTION */}

          <p className="product-details__description">
            {product.description}
          </p>


          {/* PRICE */}

          <div className="product-details__price">

            <span>
              Precio del Producto
            </span>

            <strong>
              {formatMoney(
                productPrice
              )}
            </strong>

          </div>


          {/* CASHBACK */}

          <div className="product-details__cashback">

            <span>
              Comisión
            </span>

            <strong>
              +
              {formatMoney(
                cashback
              )}
            </strong>

          </div>


          {/* ONE-TIME */}

          <div className="product-details__notice">

            <span>
              ✓
            </span>

            <p>
              Solo puedes aceptar este
              producto una vez.
            </p>

          </div>


          {/* SUMMARY */}

          <div className="product-details__summary">

            <div>

              <span>
                Precio
              </span>

              <strong>
                {formatMoney(
                  productPrice
                )}
              </strong>

            </div>


            <div>

              <span>
                Comisión
              </span>

              <strong>
                +
                {formatMoney(
                  cashback
                )}
              </strong>

            </div>


            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                {formatMoney(
                  totalAmount
                )}
              </strong>

            </div>

          </div>


          {/* BALANCE */}

          <div className="product-details__balance">

            <span>
              Tu saldo
            </span>

            <strong>
              {formatMoney(
                balance
              )}
            </strong>

          </div>


          {/* REQUIRED */}

          {!outOfStock && (

            <div className="product-details__required">

              <span>
                Saldo requerido
              </span>

              <strong>
                {formatMoney(
                  requiredBalance
                )}
              </strong>

            </div>

          )}


          {/* INSUFFICIENT BALANCE */}

          {insufficientBalance &&
            !outOfStock && (

              <div className="product-details__balance-error">

                Saldo insuficiente.
                Deposita antes de
                aceptar este producto.

              </div>

          )}


          {/* ACCEPT */}

          <button
            type="button"
            className="btn btn-primary product-details__order"
            onClick={
              handleOrder
            }
            disabled={
              ordering ||
              outOfStock
            }
          >

            {ordering

              ? "Aceptando..."

              : outOfStock

                ? "Agotado"

                : insufficientBalance

                  ? "Depósito Requerido"

                  : "Aceptar Producto"}

          </button>


        </div>

      </section>


      {/* =====================================================
          INSUFFICIENT BALANCE DEPOSIT MODAL
          ===================================================== */}

      {showDepositModal && (
        <div
          className="product-details__deposit-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="insufficient-balance-title"
          onClick={() =>
            setShowDepositModal(false)
          }
        >

          <div
            className="product-details__deposit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="product-details__deposit-close"
              aria-label="Cerrar"
              onClick={() =>
                setShowDepositModal(false)
              }
            >
              ×
            </button>


            <div className="product-details__deposit-icon">
              💳
            </div>


            <h2 id="insufficient-balance-title">
              Saldo Insuficiente
            </h2>


            <p className="product-details__deposit-message">
              No tienes suficiente saldo para
              aceptar este producto.
            </p>


            <div className="product-details__deposit-summary">

              <div>
                <span>
                  Precio del Producto
                </span>

                <strong>
                  {formatMoney(
                    requiredBalance
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Tu Saldo
                </span>

                <strong>
                  {formatMoney(
                    balance
                  )}
                </strong>
              </div>


              <div className="product-details__deposit-required">

                <span>
                  Depósito Requerido
                </span>

                <strong>
                  {formatMoney(
                    depositAmount
                  )}
                </strong>

              </div>

            </div>


            <p className="product-details__deposit-help">
              Deposita al menos{" "}
              <strong>
                {formatMoney(
                  depositAmount
                )}
              </strong>{" "}
              para continuar con este producto.
            </p>


            <div className="product-details__deposit-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setShowDepositModal(false)
                }
              >
                Cancelar
              </button>


              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {

                  setShowDepositModal(
                    false
                  );

                  navigate(
                    "/deposit",
                    {
                      state: {
                        requiredAmount:
                          depositAmount,
                        productId:
                          product._id,
                      },
                    }
                  );

                }}
              >
                Depositar{" "}
                {formatMoney(
                  depositAmount
                )}
              </button>

            </div>

          </div>

        </div>
      )}


    </div>
  );
}


export default ProductDetails;