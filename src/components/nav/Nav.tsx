import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { IoMdMenu } from "react-icons/io";
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

  const DrawerList = (
    <Box
      sx={{ width: 260 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      className="font-sans text-charcoal"
    >
      <List>
        {routes.slice(0, 2).map((route) => {
          const isActive = location.pathname === route.url;
          return (
            <ListItem key={route.id} disablePadding>
              <ListItemButton onClick={() => navigate(route.url)}>
                <ListItemText
                  primary={route.name}
                  slotProps={{
                    primary: {
                      className: isActive
                        ? "font-sans font-semibold text-navy"
                        : "font-sans font-medium text-charcoal/80",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/#faq"
          >
            <ListItemText
              primary="FAQ"
              slotProps={{
                primary: {
                  className: "font-sans font-medium text-charcoal/80",
                },
              }}
            />
          </ListItemButton>
        </ListItem>
        {routes.slice(2).map((route) => {
          const isActive = location.pathname === route.url;
          return (
            <ListItem key={route.id} disablePadding>
              <ListItemButton onClick={() => navigate(route.url)}>
                <ListItemText
                  primary={route.name}
                  slotProps={{
                    primary: {
                      className: isActive
                        ? "font-sans font-semibold text-navy"
                        : "font-sans font-medium text-charcoal/80",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        <ListItem className="px-4 pt-2">
          <ListItemButton
            className="inline-flex items-center justify-center h-10 px-space-lg bg-gold! hover:bg-gold-hover! text-navy! font-semibold text-sm rounded-md tracking-wide transition-colors"
            onClick={() => navigate("/register")}
          >
            <ListItemText
              primary={"Register"}
              slotProps={{
                primary: {
                  className: "text-center font-sans font-semibold text-navy text-sm",
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest text-charcoal antialiased selection:bg-gold selection:text-on-primary">
      {location.pathname !== "/dashboard" && (
        <header className="sticky top-0 z-50 bg-surface-container-lowest h-20 border-b border-bordergray transition-all duration-200">
          <nav
            aria-label="Primary Navigation"
            className="relative max-w-custom mx-auto h-full px-space-lg lg:px-8 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]"
          >
            <div className="logo justify-self-start">
              <Link
                to={"/"}
                aria-label="RCCG The Americas-1 School of Disciples Home"
                className="flex items-center group focus:outline-none focus:ring-2 focus:ring-navy rounded-lg py-1"
              >
                <div className="flex items-center">
                  {/* <img */}
                  {/*   src="/images/rcg.png" */}
                  {/*   loading="eager" */}
                  {/*   alt="RCCG Logo" */}
                  {/*   className="h-16" */}
                  {/* /> */}
                  <img
                    src="/images/logo.png"
                    loading="eager"
                    alt="School of Disciples Logo"
                    className="h-11 sm:h-12 w-auto"
                  />
                  <img
                    src="/images/sod-logo.png"
                    loading="eager"
                    alt="School of Disciples Logo"
                    className="h-11 sm:h-12 w-auto"
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
              <div className="md:hidden">
                <Button onClick={toggleDrawer(true)} aria-label="Open navigation menu">
                  <IoMdMenu size={28} className="text-navy" />
                </Button>
              </div>
            </div>

            <Drawer open={open} onClose={toggleDrawer(false)}>
              <div className="py-4 bg-surface-container-lowest h-full">
                <div className="logo px-4 pb-3 border-b border-bordergray">
                  <Link to={"/"} onClick={toggleDrawer(false)}>
                    <div className="flex items-center gap-3 justify-self-end">
                      {/* <img */}
                      {/*   src="/images/logo.png" */}
                      {/*   alt="School of Disciples Logo" */}
                      {/*   className="h-16" */}
                      {/* /> */}
                      <img
                        src="/images/sod-logo.png"
                        alt="RCCG Logo"
                        className="h-12"
                      />
                    </div>
                  </Link>
                </div>
                {DrawerList}
              </div>
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
