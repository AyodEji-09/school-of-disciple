import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import type { PropsWithChildren } from "react";
import { useAppSelector } from "../data/hooks";
import {
  selectAuth,
  selectLoading,
  selectUser,
} from "../data/selectors/authSelector";
import { hasCompletedIntake } from "./intake";

export const LoadingScreen = () => (
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

export const SuperAdminRoute = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);

  if (loading) return <LoadingScreen />;
  if (!auth) return <Navigate to="/" replace />;
  if (user?.deactivated) return <Navigate to="/" replace />;
  if (user?.type === "admin" || user?.type === "super") return <Outlet />;
  return <Navigate to="/dashboard" replace />;
};

export const UserRoute = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);

  if (loading) return <LoadingScreen />;
  if (!auth) return <Navigate to="/" replace />;
  if (user?.deactivated) return <Navigate to="/" replace />;
  if (user?.type === "user" && !hasCompletedIntake(user)) {
    return <Navigate to="/onboarding/1" replace />;
  }
  if (user?.type !== "user") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export const OnboardingRoute = ({ children }: PropsWithChildren) => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);

  if (loading) return <LoadingScreen />;
  if (!auth) return <Navigate to="/" replace />;
  if (user?.deactivated) return <Navigate to="/" replace />;
  if (user?.type !== "user") return <Navigate to="/dashboard" replace />;
  if (hasCompletedIntake(user)) return <Navigate to="/my-dashboard" replace />;
  return children ? <>{children}</> : <Outlet />;
};

export const PublicRoute = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (auth) {
    const destination =
      user?.type === "user"
        ? hasCompletedIntake(user)
          ? "/my-dashboard"
          : "/onboarding/1"
        : "/dashboard";
    return <Navigate to={destination} state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export const PrivateRoute = ({ isAuth }: { isAuth: boolean }) => {
  const loading = useAppSelector(selectLoading);
  if (loading) return <LoadingScreen />;
  return isAuth ? <Outlet /> : <Navigate to="/" replace />;
};
