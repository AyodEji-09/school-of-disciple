import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { PulseLoader } from "react-spinners";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Nav from "./components/nav/Nav";
import { SetDefaultHeaders } from "./data/config";
import Payment from "./pages/Payment";
import Team from "./pages/Team";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import Dashboard from "./admin/dashboard";
import AddCenterManager from "./admin/dashboard/invite-cordinator";
import CenterManager from "./admin/dashboard/[id]";
import Centers from "./admin/manage-centers/centers";
import AddCenter from "./admin/manage-centers/add-center";
import AcceptInvite from "./pages/accept-invite";
import Payments from "./admin/payments";
import PaymentUser from "./admin/payments/[id]";
import UserDashboard from "./pages/UserDashboard";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/Onboarding";

import StudentsPage from "./admin/students";
import CreditAdminPage from "./admin/credit-admin";
import ManualOrderPage from "./pages/manual-order";

import store from "./data/store";
import { loadUser } from "./data/reducers/userSlice";
import { useAppSelector } from "./data/hooks";
import {
  selectAuth,
  selectLoading,
  selectUser,
} from "./data/selectors/authSelector";
import {
  AdminRoute,
  UserRoute,
  PublicRoute,
  OnboardingRoute,
  SuperAdminRoute,
} from "./utils/private-route.component";
import { hasCompletedIntake } from "./utils/intake";
import SettingsPage from "./admin/settings";

SetDefaultHeaders();

const SmartRedirect = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5FAFF]">
        <PulseLoader size={10} color="#001EC5" />
      </div>
    );
  }

  if (!auth) return <Home />;
  if (user?.type === "user") {
    const completed = hasCompletedIntake(user);
    return (
      <Navigate to={completed ? "/my-dashboard" : "/onboarding/1"} replace />
    );
  }
  return <Navigate to="/dashboard" replace />;
};

const ProfileRoute = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5FAFF]">
        <PulseLoader size={10} color="#001EC5" />
      </div>
    );
  }

  if (!auth) return <Navigate to="/" replace />;
  if (user?.type === "user" && !hasCompletedIntake(user)) {
    return <Navigate to="/onboarding/1" replace />;
  }
  return <ProfilePage />;
};

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <>
      <ToastContainer position="top-right" />
      <Routes>
        <Route path="/profile" element={<ProfileRoute />} />
        <Route
          path="/onboarding/:step"
          element={
            <OnboardingRoute>
              <OnboardingPage />
            </OnboardingRoute>
          }
        />
        <Route
          path="/onboarding"
          element={<Navigate to="/onboarding/1" replace />}
        />
        <Route element={<Nav />}>
          <Route index element={<SmartRedirect />} />

          <Route element={<PublicRoute />}>
            <Route path="/team" element={<Team />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/payment/:token" element={<Payment />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/add-manager" element={<AddCenterManager />} />
          <Route path="/dashboard/manager/:id" element={<CenterManager />} />
          <Route path="/dashboard/manage-centers" element={<Centers />} />
          <Route
            path="/dashboard/manage-centers/add-center"
            element={<AddCenter />}
          />
          <Route path="/dashboard/students" element={<StudentsPage />} />
          <Route path="/dashboard/students/:id" element={<PaymentUser />} />
          <Route path="/dashboard/payments" element={<Payments />} />
          <Route
            path="/dashboard/payments/users/:id"
            element={<PaymentUser />}
          />
          <Route
            path="/dashboard/payments/user/:id"
            element={<PaymentUser />}
          />

          <Route path="/dashboard/credit-admin" element={<CreditAdminPage />} />
          <Route path="/dashboard/manual-order" element={<ManualOrderPage />} />
          <Route element={<SuperAdminRoute />}>
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<UserRoute />}>
          <Route path="/my-dashboard" element={<UserDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
