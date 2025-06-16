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
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  const location = useLocation();
  console.log(location.pathname);
  

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {routes.map((route) => (
          <ListItem key={route.id} disablePadding>
            <ListItemButton>
              <Link to={route.url}>
                <ListItemText primary={route.name} />
              </Link>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div className="">
      <div className="absolute inset-x-0 top-0 z-10 bg-linear-to-r from-cyan-500 to-blue-500">
        {location.pathname !== "/dashboard" && (
          <nav className="container mx-auto py-2 text-white px-4">
            <div className="flex justify-between gap-4 items-center">
              <div className="logo">
                <Link to={"/"}>
                  <div className="flex items-center">
                    <img src="/images/logo.png" alt="" className="h-16" />
                    <img src="/images/rcg.png" alt="" className="h-16" />
                  </div>
                </Link>
              </div>
              <div className="md:hidden">
                <Button onClick={toggleDrawer(true)}>
                  <IoMdMenu size={32} color="#fff" />
                </Button>
              </div>
              <div className="menu hidden md:flex gap-4 items-center">
                {routes.map((route) => (
                  <Link key={route.id} to={route.url} className="">
                    {route.name}
                  </Link>
                ))}
                <div>
                  <Button
                    variant="contained"
                    sx={{
                      background: "#FFC107",
                      color: "#333",
                      borderRadius: 20,
                      fontSize: 12,
                      minWidth: 150,
                      height: 40,
                    }}
                    onClick={() => navigate("/register")}
                  >
                    Register
                  </Button>
                </div>
              </div>
            </div>
            <Drawer open={open} onClose={toggleDrawer(false)}>
              <div className="py-4">
                <div className="logo">
                  <Link to={"/"}>
                    <div className="flex items-center">
                      <img src="/images/logo.png" alt="" className="h-16" />
                      <img src="/images/rcg.png" alt="" className="h-16" />
                    </div>
                  </Link>
                </div>
                {DrawerList}
              </div>
            </Drawer>
          </nav>
        )}
      </div>
      <Outlet />
      <Footer />
    </div>
  );
};

export default Nav;
