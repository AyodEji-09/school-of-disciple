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
import AddCenterManager from "./admin/dashboard/add-facility-manager";
import CenterManager from "./admin/dashboard/[id]";

SetDefaultHeaders();

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" />
      <Routes>
        <Route path="/" element={<Nav />}>
          <Route index element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/courses" element={<Course />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/add-manager" element={<AddCenterManager />} />
          <Route path="/dashboard/manager" element={<CenterManager />} />
          <Route path="/profile" element={<Login />} />
          <Route path="/payments" element={<Login />} />
          <Route path="/manage-centers" element={<Login />} />
          <Route path="/payment/:token" element={<Payment />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
