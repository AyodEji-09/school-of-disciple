import {
  Avatar,
  Box,
  Container,
  Drawer,
  Dropdown,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Menu,
  MenuButton,
  Stack,
} from "@mui/joy";
import Profile from "../profile/Profile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Brand from "../brand/brand";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import { capitalizeWords } from "../../utils";

const DefaultHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);

  const [open, setOpen] = useState(false);
  const toggleDrawer =
    (inOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setOpen(inOpen);
    };

  const routes = [
    {
      id: 1,
      name: "Dashboard",
      url: "/dashboard",
      role: ["admin", "coordinator"],
    },
    { id: 2, name: "centers", url: "/manage-centers", role: ["admin"] },
    { id: 3, name: "Students", url: "/dashboard/students", role: ["admin"] },
    {
      id: 4,
      name: "Payments",
      url: "/payments",
      role: ["admin", "coordinator"],
    },
    {
      id: 5,
      name: "Registration",
      url: "/registration",
      role: ["admin"],
    },
    {
      id: 6,
      name: "Settings",
      url: "/dashboard/settings",
      role: ["admin"],
    },
    {
      id: 7,
      name: "Dashboard",
      url: "/my-dashboard",
      role: ["user"],
    },
    // {
    //   id: 6,
    //   name: "Fees",
    //   url: "/fees",
    //   role: ["user"],
    // },
  ];

  return (
    <Box component={"nav"} bgcolor={"white"} mb={4}>
      <Container>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={2}
          py={2}
        >
          <div className="hidden md:block">
            <Link to="/">
              <div className="flex items-center">
                <img src="/images/logo.png" alt="School of Disciples Logo" className="h-10" />
                <img src="/images/rcg.png" alt="RCCG Logo" className="h-10" />
              </div>
            </Link>
          </div>
          <div className="md:hidden">
            <IconButton
              sx={{
                color: "white",
                borderRadius: "25px",
                border: "none",
                background: "#001EC5",
              }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </div>
          <div className="hidden md:flex gap-4">
            {routes
              .filter((route) => user?.type ? route.role.includes(user.type) : false)
              .map((route) => (
                <button
                  key={route.id}
                  className={`border border-[#001F54] capitalize rounded-md text-[#001F54] active:bg-[#001EC51A] active:border-transparent h-10 px-4 ${
                    location.pathname === route.url &&
                    "bg-[#001EC51A] border-transparent"
                  }`}
                  onClick={() => navigate(route.url)}
                >
                  {route.name}
                </button>
              ))}
          </div>
          <Dropdown>
            <MenuButton
              sx={{ border: "none", ":hover": { background: "none" } }}
            >
              <Avatar src={user?.avatar?.url || ""} size="md">
                {capitalizeWords(user?.firstName?.[0] ?? "")}
                {capitalizeWords(user?.lastName?.[0] ?? "")}
              </Avatar>
            </MenuButton>
            <Menu
              //   sx={{ minWidth: 160, '--ListItemDecorator-size': '24px' }}
              sx={{
                "--List-padding": "0.5rem",
                "--ListItemDecorator-size": "3rem",
                background: "#F4F5F7",
                maxWidth: 400,
              }}
            >
              <Profile />
            </Menu>
          </Dropdown>
        </Stack>
      </Container>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box role="presentation" sx={{ background: "white" }} height={"100vh"}>
          <Box padding={2}>
            <Brand type="img" />
          </Box>
          <List>
            {routes
              .filter((route) => user?.type ? route.role.includes(user.type) : false)
              .map((route) => (
                <ListItem
                  key={route.id}
                  onClick={() => {
                    navigate(route.url);
                    setOpen(false);
                  }}
                  onKeyDown={toggleDrawer(false)}
                >
                  <ListItemButton>{route.name}</ListItemButton>
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default DefaultHeader;
