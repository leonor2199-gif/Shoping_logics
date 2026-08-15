import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import userService from "../../services/userService";


function formatMoney(
  value
) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}


function Home() {

  const {
    user,
  } = useAuth();


  const [
    currentBalance,
    setCurrentBalance,
  ] = useState(
    user?.balance ?? 0
  );


  // =========================================================
  // CAROUSEL
  // =========================================================

  const banners = [
    {
      id: 1,
      image: "/banners/image.png",
      title: "Bienvenido",
      subtitle:
        "Descubre nuestros últimos productos",
    },

    {
      id: 2,
      image: "/banners/image2.jpg",
      title: "Promoción Especial",
      subtitle:
        "Revisa las ofertas de hoy",
    },

    {
      id: 3,
      image: "/banners/imagess.jpg",
      title: "Compra y Gana",
      subtitle:
        "Explora los productos disponibles",
    },
  ];


  const [
    activeBanner,
    setActiveBanner,
  ] = useState(0);


  // =========================================================
  // LOAD CURRENT BALANCE
  // =========================================================

  const loadCurrentBalance =
    useCallback(
      async () => {

        try {

          const response =
            await userService.getProfile();


          if (
            response?.user
          ) {

            setCurrentBalance(
              response.user.balance ??
                0
            );

          }

        } catch (error) {

          console.error(
            "Error al cargar el saldo actual:",
            error
          );

        }

      },
      []
    );


  // =========================================================
  // BALANCE AUTO REFRESH
  // =========================================================

  useEffect(() => {

    loadCurrentBalance();


    const intervalId =
      setInterval(
        loadCurrentBalance,
        5000
      );


    const handleVisibilityChange =
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {

          loadCurrentBalance();

        }

      };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {

      clearInterval(
        intervalId
      );


      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

    };

  }, [
    loadCurrentBalance,
  ]);


  // =========================================================
  // UPDATE BALANCE FROM AUTH USER
  // =========================================================

  useEffect(() => {

    if (
      user?.balance !==
      undefined
    ) {

      setCurrentBalance(
        user.balance
      );

    }

  }, [
    user?.balance,
  ]);


  // =========================================================
  // AUTOMATIC CAROUSEL
  // =========================================================

  useEffect(() => {

    if (
      banners.length <= 1
    ) {
      return;
    }


    const timer =
      setInterval(
        () => {

          setActiveBanner(
            (current) =>
              (
                current + 1
              ) %
              banners.length
          );

        },
        5000
      );


    return () => {

      clearInterval(
        timer
      );

    };

  }, [
    banners.length,
  ]);


  // =========================================================
  // CAROUSEL CONTROLS
  // =========================================================

  const showPreviousBanner =
    () => {

      setActiveBanner(
        (current) =>
          (
            current -
            1 +
            banners.length
          ) %
          banners.length
      );

    };


  const showNextBanner =
    () => {

      setActiveBanner(
        (current) =>
          (
            current + 1
          ) %
          banners.length
      );

    };


  return (

    <div className="home-page">


      {/* =====================================================
          PROMOTIONAL CAROUSEL
          ===================================================== */}

      <section className="home-carousel">

        <div className="home-carousel__viewport">

          {banners.map(
            (
              banner,
              index
            ) => (

              <div
                key={
                  banner.id
                }
                className={
                  "home-carousel__slide " +
                  (
                    index ===
                    activeBanner
                      ? "home-carousel__slide--active"
                      : ""
                  )
                }
              >

                <img
                  src={
                    banner.image
                  }
                  alt={
                    banner.title
                  }
                  className="home-carousel__image"
                />


                <div className="home-carousel__overlay">

                  <div className="home-carousel__text">

                    <span>
                      {banner.title}
                    </span>

                    <h2>
                      {banner.subtitle}
                    </h2>

                  </div>

                </div>

              </div>

            )
          )}

        </div>


        {/* PREVIOUS */}

        <button
          type="button"
          className="home-carousel__arrow home-carousel__arrow--prev"
          onClick={
            showPreviousBanner
          }
          aria-label="Banner anterior"
        >
          ‹
        </button>


        {/* NEXT */}

        <button
          type="button"
          className="home-carousel__arrow home-carousel__arrow--next"
          onClick={
            showNextBanner
          }
          aria-label="Siguiente banner"
        >
          ›
        </button>


        {/* DOTS */}

        <div className="home-carousel__dots">

          {banners.map(
            (
              banner,
              index
            ) => (

              <button
                key={
                  banner.id
                }
                type="button"
                className={
                  "home-carousel__dot " +
                  (
                    index ===
                    activeBanner
                      ? "home-carousel__dot--active"
                      : ""
                  )
                }
                onClick={() =>
                  setActiveBanner(
                    index
                  )
                }
                aria-label={
                  `Mostrar banner ${index + 1}`
                }
              />

            )
          )}

        </div>

      </section>


      {/* =====================================================
          CURRENT BALANCE
          ===================================================== */}

      <section className="balance-card">

        <div className="balance-card__current">

          <span className="balance-card__label">
            Saldo Actual
          </span>


          <div className="balance-card__amount">
            ${formatMoney(
              currentBalance
            )}
          </div>

        </div>


        <div className="balance-card__actions">

          <Link
            to="/deposit"
            className="btn btn-primary balance-card__button"
          >
            Depositar
          </Link>


          <Link
            to="/withdraw"
            className="btn balance-card__withdraw"
          >
            Retirar
          </Link>

        </div>

      </section>


      {/* =====================================================
          VIP LEVEL
          ===================================================== */}

      <section className="home-vip-card">

        <div>

          <span>
            Tu Nivel VIP
          </span>

          <strong>
            VIP {user?.vipLevel ?? 1}
          </strong>

        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
          ===================================================== */}

      <section className="quick-actions">

        <div className="section-heading">

          <h2>
            Acciones Rápidas
          </h2>


          <p>
            Gestiona tu cuenta rápidamente.
          </p>

        </div>


        <div className="quick-actions__grid">


          <Link
            to="/products"
            className="quick-action"
          >

            <div>

              <strong>
                Productos
              </strong>


              <span>
                Explora los productos disponibles
              </span>

            </div>

          </Link>


          <Link
            to="/deposit"
            className="quick-action"
          >

            <div>

              <strong>
                Depositar
              </strong>


              <span>
                Agrega fondos a tu cuenta
              </span>

            </div>

          </Link>


          <Link
            to="/withdraw"
            className="quick-action"
          >

            <div>

              <strong>
                Retirar
              </strong>


              <span>
                Solicita un retiro
              </span>

            </div>

          </Link>


          <Link
            to="/transactions"
            className="quick-action"
          >

            <div>

              <strong>
                Transacciones
              </strong>


              <span>
                Ver historial financiero
              </span>

            </div>

          </Link>


        </div>

      </section>


    </div>

  );
}


export default Home;