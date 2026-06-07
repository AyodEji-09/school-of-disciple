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
import AcceptInvite from "./pages/accept-invite";
import Payments from "./admin/payments";
import PaymentUser from "./admin/payments/[id]";
import UserDashboard from "./pages/UserDashboard";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/Onboarding";

import StudentsPage from "./admin/students";
import CreditAdminPage from "./admin/credit-admin";
import ManualOrderNewPage from "./admin/manuals/new";
import AdminManualOrdersPage from "./admin/manual-orders";

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

import Centers from "./admin/manage-centers/centers";
import AddCenter from "./admin/manage-centers/add-center";
import Coordinators from "./admin/coordinators";
import CoordinatorDetail from "./admin/coordinators/[id]";
import InviteCoordinator from "./admin/coordinators/invite";
import CoordinatorStudentsPage from "./admin/coordinator-students";

import ManualOrdersPage from "./admin/manuals";

// Configurations pages
import ConfigurationsIndex from "./admin/configurations";
import RegistrationConfigPage from "./admin/configurations/registration";
import FeesConfigPage from "./admin/configurations/fees";
import ZelleConfigPage from "./admin/configurations/zelle";

// Academic Results pages
import ResultsPage from "./admin/results";
import UploadResultPage from "./admin/results/upload";
import BulkUploadPage from "./admin/results/bulk-upload";
import EditResultPage from "./admin/results/edit";
import ResultDetailPage from "./admin/results/[id]";
import AnalyticsPage from "./admin/results/analytics";
import ReportsPage from "./admin/results/reports";
import CoordinatorReportsPage from "./coordinator/reports";
import MyResultsPage from "./pages/MyResults";
import MyResultDetailPage from "./pages/MyResultDetail";
import AcademicSetupPage from "./admin/results/setup";

// Payments sub-pages
import PendingApprovalsPage from "./admin/payments/approvals";
import RemittancesPage from "./admin/payments/remittances";

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

          {/* Coordinators */}
          <Route
            path="/dashboard/coordinators"
            element={<Coordinators />}
          />
          <Route
            path="/dashboard/coordinators/invite"
            element={<InviteCoordinator />}
          />
          <Route
            path="/dashboard/add-manager"
            element={<InviteCoordinator />}
          />
          <Route
            path="/dashboard/coordinators/:id"
            element={<CoordinatorDetail />}
          />

          {/* Centers */}
          <Route path="/dashboard/manage-centers" element={<Centers />} />
          <Route
            path="/dashboard/manage-centers/add-center"
            element={<AddCenter />}
          />

          {/* Students */}
          <Route path="/dashboard/students" element={<StudentsPage />} />
          <Route path="/dashboard/students/:id" element={<PaymentUser />} />
          <Route
            path="/dashboard/my-students"
            element={<CoordinatorStudentsPage />}
          />

          {/* Payments */}
          <Route path="/dashboard/payments" element={<Payments />} />
          <Route
            path="/dashboard/payments/approvals"
            element={<PendingApprovalsPage />}
          />
          <Route
            path="/dashboard/payments/remittances"
            element={<RemittancesPage />}
          />
          <Route
            path="/dashboard/payments/users/:id"
            element={<PaymentUser />}
          />
          <Route
            path="/dashboard/payments/user/:id"
            element={<PaymentUser />}
          />

          {/* Credit Admin (coordinator's remittance view) */}
          <Route
            path="/dashboard/credit-admin"
            element={<CreditAdminPage />}
          />

          {/* Manuals */}
          <Route path="/dashboard/manual-order" element={<ManualOrdersPage />} />
          <Route
            path="/dashboard/manual-order/new"
            element={<ManualOrderNewPage />}
          />
          <Route
            path="/dashboard/manual-orders"
            element={<AdminManualOrdersPage />}
          />

          {/* Academic Results */}
          <Route path="/dashboard/results" element={<ResultsPage />} />
          <Route
            path="/dashboard/results/upload"
            element={<UploadResultPage />}
          />
          <Route
            path="/dashboard/results/bulk-upload"
            element={<BulkUploadPage />}
          />
          <Route
            path="/dashboard/results/analytics"
            element={<AnalyticsPage />}
          />
          <Route
            path="/dashboard/results/reports"
            element={<ReportsPage />}
          />
          <Route
            path="/coordinator/reports"
            element={<CoordinatorReportsPage />}
          />
          <Route
            path="/dashboard/results/:id/edit"
            element={<EditResultPage />}
          />
          <Route
            path="/dashboard/results/:id"
            element={<ResultDetailPage />}
          />
          <Route
            path="/dashboard/academics/setup"
            element={<AcademicSetupPage />}
          />

          <Route
            path="/dashboard/configurations"
            element={<ConfigurationsIndex />}
          />
          <Route
            path="/dashboard/configurations/registration"
            element={<RegistrationConfigPage />}
          />
          <Route element={<SuperAdminRoute />}>
            <Route
              path="/dashboard/configurations/fees"
              element={<FeesConfigPage />}
            />
            <Route
              path="/dashboard/configurations/zelle"
              element={<ZelleConfigPage />}
            />
          </Route>
        </Route>

        <Route element={<UserRoute />}>
          <Route path="/my-dashboard" element={<UserDashboard />} />
          <Route path="/my-dashboard/results" element={<MyResultsPage />} />
          <Route
            path="/my-dashboard/results/:id"
            element={<MyResultDetailPage />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
