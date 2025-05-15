import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute = ({ isAuth }: { isAuth: boolean }) => {
  // Redirect to "/" if the user is not authenticated
  return isAuth ? <Outlet /> : <Navigate to="/" replace />;
};
