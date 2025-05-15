import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
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
import sod from "../../assets/images/logo.png";
import rccg from "../../assets/images/rcg.png";
import Footer from "../footer/Footer";

const routes = [
  { id: 1, name: "About", url: "/" },
  { id: 1, name: "Course", url: "/" },
  { id: 1, name: "Team", url: "/" },
  { id: 1, name: "Register", url: "/register" },
];
const Nav = () => {
  const [open, setOpen] = useState(false);

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
    <div>
      <div className="absolute inset-x-0 top-0 z-10">
        <nav className="container mx-auto py-2 text-white px-4">
          <div className="flex justify-between gap-4 items-center">
            <div className="logo">
              <Link to={"/"}>
                <div className="flex items-center">
                  <img src={sod} alt="" className="h-16" />
                  <img src={rccg} alt="" className="h-16" />
                </div>
              </Link>
            </div>
            <div className="md:hidden">
              <Button onClick={toggleDrawer(true)}>
                <IoMdMenu size={32} color="#fff" />
              </Button>
            </div>
            <div className="menu hidden md:flex gap-4">
              {routes.map((route) => (
                <Link key={route.id} to={route.url} className="">
                  {route.name}
                </Link>
              ))}
            </div>
          </div>
          <Drawer open={open} onClose={toggleDrawer(false)}>
            <div className="py-4">
              <div className="logo">
                <Link to={"/"}>
                  <div className="flex items-center">
                    <img src={sod} alt="" className="h-16" />
                    <img src={rccg} alt="" className="h-16" />
                  </div>
                </Link>
              </div>
              {DrawerList}
            </div>
          </Drawer>
        </nav>
      </div>
      <Outlet />
      <Footer />
    </div>
  );
};

export default Nav;
