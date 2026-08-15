import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";


function UserLayout() {


  const navigate = useNavigate();



  const handleLogout = () => {


    localStorage.removeItem("userToken");

    localStorage.removeItem("user");


    navigate("/login", {

      replace:true,

    });


  };



  return (


    <div className="user-layout">



      {/* =========================
          TOP LOGO BANNER
      ========================== */}


      <header className="logo-banner">


        <img

          src="/icons/logo.png"

          alt="Logo"

          className="banner-logo"

        />



        <span className="banner-title">

          Mexico

        </span>



      </header>





      {/* =========================
          PAGE CONTENT
      ========================== */}


      <main className="site-main">


        <Outlet />


      </main>





      {/* =========================
          FIXED BOTTOM NAVIGATION
      ========================== */}


      <nav className="bottom-nav">





        {/* HOME */}


        <NavLink


          to="/home"


          className={({isActive}) =>

            `bottom-nav-item ${isActive ? "active" : ""}`

          }


        >


          <span className="bottom-icon">


            <img

              src="/icons/home.png"

              alt="Home"

            />


          </span>



          <span>

            Home

          </span>



        </NavLink>

        {/* ORDERS */}

        <NavLink


          to="/orders"


          className={({isActive}) =>

            `bottom-nav-item ${isActive ? "active" : ""}`

          }


        >


          <span className="bottom-icon">


            <img

              src="/icons/orders.png"

              alt="Orders"

            />


          </span>



          <span>

            Orders

          </span>



        </NavLink>



        {/* PRODUCTS */}
        <NavLink


          to="/products"


          className={({isActive}) =>

            `bottom-nav-item ${isActive ? "active" : ""}`

          }


        >


          <span className="bottom-icon">


            <img

              src="/icons/products.png"

              alt="Products"

            />


          </span>



          <span>

            Products

          </span>



        </NavLink>




        {/* PROFILE */}



        <NavLink


          to="/profile"


          className={({isActive}) =>

            `bottom-nav-item ${isActive ? "active" : ""}`

          }


        >


          <span className="bottom-icon">


            <img

              src="/icons/profile.png"

              alt="Profile"

            />


          </span>



          <span>

            Profile

          </span>



        </NavLink>








        {/* LOGOUT */}



        <button


          className="logout-bottom"


          onClick={handleLogout}


        >


          <span className="bottom-icon">


            <img

              src="/icons/logout.png"

              alt="Logout"

            />


          </span>



          <span>

            Logout

          </span>



        </button>




      </nav>



    </div>


  );

}



export default UserLayout;
