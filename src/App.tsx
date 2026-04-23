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
import Course from "./pages/Course";
import About from "./pages/About";
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
import RegistrationWindow from "./admin/registration";

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
} from "./utils/private-route.component";

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
  if (user?.type === "user") return <Navigate to="/my-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const ProfileRoute = () => {
  const auth = useAppSelector(selectAuth);
  const loading = useAppSelector(selectLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5FAFF]">
        <PulseLoader size={10} color="#001EC5" />
      </div>
    );
  }

  if (!auth) return <Navigate to="/" replace />;
  return <ProfilePage />;
};

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  const auth = useAppSelector(selectAuth);

  return (
    <>
      <ToastContainer position="top-right" />
      <Routes>
        <Route path="/profile" element={<ProfileRoute />} />
        <Route path="/" element={!auth && <Nav />}>
          <Route index element={<SmartRedirect />} />

          <Route element={<AdminRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard/add-manager"
              element={<AddCenterManager />}
            />
            <Route path="/dashboard/manager/:id" element={<CenterManager />} />
            <Route path="/dashboard/students/:id" element={<PaymentUser />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/users/:id" element={<PaymentUser />} />
            <Route path="/payments/user/:id" element={<PaymentUser />} />
            <Route path="/manage-centers" element={<Centers />} />
            <Route path="/manage-centers/add-center" element={<AddCenter />} />
            <Route path="/registration" element={<RegistrationWindow />} />
          </Route>

          <Route element={<UserRoute />}>
            <Route path="/my-dashboard" element={<UserDashboard />} />
          </Route>

          <Route element={<PublicRoute />}>
            <Route path="/team" element={<Team />} />
            <Route path="/courses" element={<Course />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/payment/:token" element={<Payment />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
