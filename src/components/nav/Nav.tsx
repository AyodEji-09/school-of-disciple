import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import Footer from "../footer/Footer";

const routes = [
  { id: 1, name: "Home", url: "/" },
  // { id: 2, name: "Courses", url: "/courses" },
  { id: 3, name: "Team", url: "/team" },
  { id: 4, name: "Login", url: "/login" },
];
const Nav = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerContent = (
    <div className="flex flex-col h-full bg-surface-container-lowest text-charcoal">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-bordergray bg-surface-container-low/40">
        <Link
          to="/"
          onClick={toggleDrawer(false)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <img
            src="/images/logo.png"
            alt="School of Disciples Logo"
            className="h-8 w-auto"
          />
          <img
            src="/images/sod-logo.png"
            alt="RCCG Logo"
            className="h-8 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={toggleDrawer(false)}
          aria-label="Close navigation menu"
          className="p-1.5 rounded-lg text-charcoal/70 hover:text-navy hover:bg-coolgray transition-colors cursor-pointer"
        >
          <IoMdClose size={22} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <Link
          to="/"
          onClick={toggleDrawer(false)}
          className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === "/"
              ? "bg-navy/5 text-navy font-semibold"
              : "text-charcoal/80 hover:bg-coolgray hover:text-navy"
          }`}
        >
          Home
        </Link>
        <Link
          to="/team"
          onClick={toggleDrawer(false)}
          className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === "/team"
              ? "bg-navy/5 text-navy font-semibold"
              : "text-charcoal/80 hover:bg-coolgray hover:text-navy"
          }`}
        >
          Team
        </Link>
        <a
          href="/#faq"
          onClick={toggleDrawer(false)}
          className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-charcoal/80 hover:bg-coolgray hover:text-navy transition-colors"
        >
          FAQ
        </a>
        <Link
          to="/login"
          onClick={toggleDrawer(false)}
          className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === "/login"
              ? "bg-navy/5 text-navy font-semibold"
              : "text-charcoal/80 hover:bg-coolgray hover:text-navy"
          }`}
        >
          Login
        </Link>
      </nav>

      {/* Bottom CTA / Action */}
      <div className="p-4 border-t border-bordergray bg-surface-container-low/30 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            toggleDrawer(false)();
            navigate("/register");
          }}
          className="w-full inline-flex items-center justify-center h-11 px-6 bg-gold hover:bg-gold-hover text-navy font-semibold text-sm rounded-md tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
        >
          Register
        </button>
        <p className="text-center text-[11px] text-outline">
          RCCG The Americas-1 • School of Disciples
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest text-charcoal antialiased selection:bg-gold selection:text-on-primary">
      {location.pathname !== "/dashboard" && (
        <header className="sticky top-0 z-50 bg-surface-container-lowest h-16 sm:h-20 border-b border-bordergray transition-all duration-200">
          <nav
            aria-label="Primary Navigation"
            className="relative max-w-custom mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]"
          >
            <div className="logo justify-self-start">
              <Link
                to={"/"}
                aria-label="RCCG The Americas-1 School of Disciples Home"
                className="flex items-center group focus:outline-none focus:ring-2 focus:ring-navy rounded-lg py-1"
              >
                <div className="flex items-center">
                  <img
                    src="/images/logo.png"
                    loading="eager"
                    alt="School of Disciples Logo"
                    className="h-9 sm:h-12 w-auto"
                  />
                  <img
                    src="/images/sod-logo.png"
                    loading="eager"
                    alt="School of Disciples Logo"
                    className="h-9 sm:h-12 w-auto"
                  />
                </div>
              </Link>
            </div>

            <div className="menu hidden md:flex items-center justify-center justify-self-center space-x-8">
              {routes.slice(0, 2).map((route) => {
                const isActive = location.pathname === route.url;
                return (
                  <Link
                    key={route.id}
                    to={route.url}
                    className={
                      isActive
                        ? "text-navy font-semibold text-label-lg py-1 border-b-2 border-navy transition-colors"
                        : "text-charcoal/80 font-medium text-label-lg py-1 hover:text-navy transition-colors"
                    }
                  >
                    {route.name}
                  </Link>
                );
              })}
              <a
                href="/#faq"
                className="text-charcoal/80 font-medium text-label-lg py-1 hover:text-navy transition-colors"
              >
                FAQ
              </a>
              {routes.slice(2).map((route) => {
                const isActive = location.pathname === route.url;
                return (
                  <Link
                    key={route.id}
                    to={route.url}
                    className={
                      isActive
                        ? "text-navy font-semibold text-label-lg py-1 border-b-2 border-navy transition-colors"
                        : "text-charcoal/80 font-medium text-label-lg py-1 hover:text-navy transition-colors"
                    }
                  >
                    {route.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3 justify-self-end">
              <div className="hidden md:block">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center justify-center h-10 px-space-lg bg-gold hover:bg-gold-hover text-navy font-semibold text-sm rounded-md tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold cursor-pointer"
                >
                  Register
                </button>
              </div>
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  onClick={toggleDrawer(true)}
                  aria-label="Open navigation menu"
                  className="p-2 -mr-1 rounded-lg text-navy hover:bg-coolgray transition-colors focus:outline-none focus:ring-2 focus:ring-navy/20 cursor-pointer"
                >
                  <IoMdMenu size={26} />
                </button>
              </div>
            </div>

            <Drawer
              anchor="right"
              open={open}
              onClose={toggleDrawer(false)}
              slotProps={{
                paper: {
                  sx: {
                    width: "min(300px, 82vw)",
                    backgroundColor: "#FFFFFF",
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  },
                },
              }}
            >
              {DrawerContent}
            </Drawer>
          </nav>
        </header>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Nav;
