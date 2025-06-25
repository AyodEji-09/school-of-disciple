import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Nav from "./components/nav/Nav";
import { SetDefaultHeaders } from "./data/config";
import Payment from "./pages/Payment";
import Team from "./pages/Team";
import Course from "./pages/Course";
import About from "./pages/About";
import Login from "./pages/login";
import Dashboard from "./admin/dashboard";
import AddCenterManager from "./admin/dashboard/invite-cordinator";
import CenterManager from "./admin/dashboard/[id]";
import { useEffect } from "react";
import store from "./data/store";
import { loadUser } from "./data/reducers/userSlice";
import { useAppSelector } from "./data/hooks";
import { selectAuth } from "./data/selectors/authSelector";
import { PrivateRoute } from "./utils/private-route.component";
import Centers from "./admin/manage-centers/centers";
import AddCenter from "./admin/manage-centers/add-center";
import AcceptInvite from "./pages/accept-invite";
import Payments from "./admin/payments";

SetDefaultHeaders();

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  const auth = useAppSelector(selectAuth);
  console.log(auth);

  return (
    <>
      <ToastContainer position="top-right" />
      <Routes>
        <Route path="/" element={!auth && <Nav />}>
          <Route index element={auth ? <Dashboard /> : <Home />} />
          <Route element={<PrivateRoute isAuth={auth} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard/add-manager"
              element={<AddCenterManager />}
            />
            <Route path="/dashboard/manager/:id" element={<CenterManager />} />
            <Route path="/profile" element={<Login />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/manage-centers" element={<Centers />} />
            <Route path="/manage-centers/add-center" element={<AddCenter />} />
          </Route>
          <Route path="/team" element={<Team />} />
          <Route path="/courses" element={<Course />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/payment/:token" element={<Payment />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
