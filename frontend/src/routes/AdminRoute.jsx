import { Navigate, Outlet, useLocation } from "react-router-dom";

function AdminRoute() {
  const location = useLocation();

  const adminToken =
    localStorage.getItem("adminToken");

  console.log(
    "AdminRoute checking token:",
    adminToken
  );

  // No admin token → admin login
  if (!adminToken) {
    console.log(
      "AdminRoute: NO ADMIN TOKEN"
    );

    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  console.log(
    "AdminRoute: ADMIN TOKEN FOUND"
  );

  return <Outlet />;
}

export default AdminRoute;