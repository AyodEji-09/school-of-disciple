import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { useAppSelector } from "../data/hooks";
import {
  selectAuth,
  selectLoading,
  selectUser,
} from "../data/selectors/authSelector";

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#F5FAFF]">
    <PulseLoader size={10} color="#001EC5" />
  </div>
);

export const AdminRoute = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);

  if (loading) return <LoadingScreen />;
  if (!auth) return <Navigate to="/" replace />;
  if (user?.deactivated) return <Navigate to="/" replace />;
  if (user?.type === "user") return <Navigate to="/my-dashboard" replace />;
  return <Outlet />;
};

export const UserRoute = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);

  if (loading) return <LoadingScreen />;
  if (!auth) return <Navigate to="/" replace />;
  if (user?.deactivated) return <Navigate to="/" replace />;
  if (user?.type !== "user") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export const PublicRoute = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (auth) {
    const destination = user?.type === "user" ? "/my-dashboard" : "/dashboard";
    return <Navigate to={destination} state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export const PrivateRoute = ({ isAuth }: { isAuth: boolean }) => {
  const loading = useAppSelector(selectLoading);
  if (loading) return <LoadingScreen />;
  return isAuth ? <Outlet /> : <Navigate to="/" replace />;
};
