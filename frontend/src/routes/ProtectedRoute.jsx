import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
  const location = useLocation();

  const userToken =
    localStorage.getItem("userToken");

  console.log(
    "ProtectedRoute checking user token:",
    userToken
  );

  // User is not logged in
  if (!userToken) {
    console.log(
      "ProtectedRoute: NO USER TOKEN"
    );

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  console.log(
    "ProtectedRoute: USER TOKEN FOUND"
  );

  return <Outlet />;
}

export default ProtectedRoute;