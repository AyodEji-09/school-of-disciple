import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  Dropdown,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/joy";
import Profile from "../profile/Profile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Brand from "../brand/brand";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import { capitalizeWords, getUserFullName, handleError } from "../../utils";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../../data/rtk/notification";
import {
  useConfirmTransactionMutation,
  useRejectTransactionMutation,
} from "../../data/rtk/transaction";
import { toast } from "react-toastify";
import moment from "moment";

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const DefaultHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";

  const [open, setOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

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

  const { data: notificationsRes } = useGetNotificationsQuery(undefined, {
    skip: !user,
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [confirmTransaction] = useConfirmTransactionMutation();
  const [rejectTransaction] = useRejectTransactionMutation();

  const notifications = notificationsRes?.data ?? [];
  const pendingCount = notifications.filter((n: any) => !n.isRead).length;

  const handleConfirm = async (transactionId: string, notificationId: string) => {
    if (!window.confirm("Confirm this transaction as received?")) return;
    setActionId(transactionId);
    try {
      await confirmTransaction(transactionId).unwrap();
      await markAsRead(notificationId).unwrap();
      toast.success("Transaction confirmed successfully");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (transactionId: string, notificationId: string) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return;
    setActionId(transactionId);
    try {
      await rejectTransaction({ id: transactionId, reason: reason || undefined }).unwrap();
      await markAsRead(notificationId).unwrap();
      toast.success("Transaction rejected");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setActionId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const routes = [
    {
      id: 1,
      name: "Dashboard",
      url: "/dashboard",
      role: ["admin", "coordinator"],
    },
    {
      id: 2,
      name: "Manage Centers",
      url: "/dashboard/manage-centers",
      role: ["admin"],
    },
    { id: 3, name: "Students", url: "/dashboard/students", role: ["admin"] },
    {
      id: 4,
      name: "Payments",
      url: "/dashboard/payments",
      role: ["admin", "coordinator"],
    },
    {
      id: 5,
      name: "Settings",
      url: "/dashboard/settings",
      role: ["admin"],
    },
    {
      id: 6,
      name: "Credit Admin",
      url: "/dashboard/credit-admin",
      role: ["coordinator"],
    },
    {
      id: 7,
      name: "Dashboard",
      url: "/my-dashboard",
      role: ["user"],
    },
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
          {/* Logo */}
          <div className="hidden md:block">
            <Link to="/">
              <div className="flex items-center">
                <img
                  src="/images/logo.png"
                  alt="School of Disciples Logo"
                  className="h-10"
                />
                <img src="/images/rcg.png" alt="RCCG Logo" className="h-10" />
              </div>
            </Link>
          </div>

          {/* Mobile hamburger */}
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

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-4">
            {routes
              .filter((route) =>
                user?.type ? route.role.includes(user.type) : false,
              )
              .map((route) => (
                <button
                  key={route.id}
                  className={`border border-[#001F54] capitalize rounded-md text-[#001F54] active:bg-[#001EC51A] active:border-transparent h-10 px-4 ${
                    location.pathname === route.url
                      ? "bg-[#001EC51A] border-transparent"
                      : ""
                  }`}
                  onClick={() => navigate(route.url)}
                >
                  {route.name}
                </button>
              ))}
          </div>

          {/* Right side: bell + avatar */}
          <Stack direction="row" alignItems="center" gap={1.5}>
            {/* Notification bell – admin only */}
            {isAdmin && (
              <Dropdown>
                <MenuButton
                  sx={{
                    border: "none",
                    background: "none",
                    ":hover": { background: "#F5FAFF" },
                    borderRadius: "50%",
                    p: 0.75,
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  {/* Bell with badge */}
                  <Box sx={{ position: "relative", display: "flex" }}>
                    <NotificationsNoneOutlinedIcon
                      sx={{ fontSize: 24, color: "#001F54" }}
                    />
                    {pendingCount > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          minWidth: 16,
                          height: 16,
                          px: "3px",
                          borderRadius: "8px",
                          bgcolor: "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "white",
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </Box>
                    )}
                  </Box>
                </MenuButton>                <Menu
                  placement="bottom-end"
                  sx={{
                    "--List-padding": "0",
                    maxWidth: 400,
                    width: "min(400px, 92vw)",
                    maxHeight: "min(520px, 85vh)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    p: 0,
                  }}
                >
                  {/* Panel header */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      flexShrink: 0,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography level="title-sm">
                        Notifications
                      </Typography>
                      {pendingCount > 0 && (
                        <Button
                          size="sm"
                          variant="plain"
                          color="primary"
                          onClick={handleMarkAllRead}
                          sx={{ fontSize: "11px", fontWeight: 600, p: 0.5 }}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  {/* Scrollable list */}
                  <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
                    {notifications.length === 0 ? (
                      <Box
                        sx={{
                          py: 5,
                          px: 3,
                          textAlign: "center",
                        }}
                      >
                        <Typography level="body-sm" textColor="neutral.400">
                          All caught up — no new notifications.
                        </Typography>
                      </Box>
                    ) : (
                      notifications.map((n: any, idx: number) => {
                        const isPendingTx = n.type === "transaction_pending" && !n.isRead;
                        const txId = n.transactionId?._id || n.transactionId;
                        const receiptUrl = n.transactionId?.zelleReceiptUrl;

                        return (
                          <Box key={n._id} sx={{ bgcolor: n.isRead ? "transparent" : "#F0F7FF" }}>
                            {idx > 0 && <Divider />}
                            <Box sx={{ px: 2.5, py: 2 }}>
                              {/* Header row: Status tag or Notification Type + time */}
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                mb={0.5}
                              >
                                <Typography
                                  level="title-xs"
                                  sx={{
                                    fontWeight: 600,
                                    color: n.isRead ? "neutral.600" : "#001F54",
                                  }}
                                >
                                  {n.type === "transaction_pending"
                                    ? "Pending Zelle Approval"
                                    : n.type === "transaction_confirmed"
                                      ? "Payment Confirmed"
                                      : n.type === "transaction_rejected"
                                        ? "Payment Rejected"
                                        : "Notification"}
                                </Typography>
                                <Typography
                                  level="body-xs"
                                  textColor="neutral.500"
                                  sx={{ flexShrink: 0, ml: 1 }}
                                >
                                  {moment(n.createdAt).fromNow()}
                                </Typography>
                              </Stack>

                              {/* Notification Message */}
                              <Typography
                                level="body-sm"
                                textColor="neutral.700"
                                sx={{ mb: isPendingTx ? 1.5 : 0.5 }}
                              >
                                {n.message}
                              </Typography>

                              {/* Quick Actions (only if Zelle transaction is pending confirmation) */}
                              {isPendingTx && txId && (
                                <Stack direction="column" gap={1} sx={{ mt: 1 }}>
                                  {receiptUrl && (
                                    <Box mb={0.5}>
                                      <a
                                        href={receiptUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          fontSize: "12px",
                                          color: "#001EC5",
                                          textDecoration: "underline",
                                          fontWeight: 600,
                                        }}
                                      >
                                        View Receipt →
                                      </a>
                                    </Box>
                                  )}
                                  <Stack direction="row" gap={1}>
                                    <Button
                                      size="sm"
                                      color="success"
                                      variant="solid"
                                      loading={actionId === txId}
                                      disabled={actionId === txId}
                                      onClick={() => handleConfirm(txId, n._id)}
                                      sx={{ fontWeight: 600, flex: 1 }}
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      color="danger"
                                      variant="outlined"
                                      loading={actionId === txId}
                                      disabled={actionId === txId}
                                      onClick={() => handleReject(txId, n._id)}
                                      sx={{ fontWeight: 600, flex: 1 }}
                                    >
                                      Reject
                                    </Button>
                                  </Stack>
                                </Stack>
                              )}

                              {/* Read button for other unread notifications */}
                              {!n.isRead && !isPendingTx && (
                                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
                                  <Button
                                    size="sm"
                                    variant="plain"
                                    color="neutral"
                                    onClick={() => markAsRead(n._id)}
                                    sx={{ fontSize: "11px", p: 0 }}
                                  >
                                    Mark as read
                                  </Button>
                                </Stack>
                              )}
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </Box>

                  {/* Footer link */}
                  <Divider />
                  <MenuItem
                    onClick={() => navigate("/dashboard/payments")}
                    sx={{
                      justifyContent: "center",
                      color: "#001EC5",
                      fontWeight: 600,
                      fontSize: 13,
                      py: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    View All Payments →
                  </MenuItem>
                </Menu>
              </Dropdown>
            )}

            {/* Avatar / profile menu */}
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
        </Stack>
      </Container>

      {/* Mobile drawer */}
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box role="presentation" sx={{ background: "white" }} height={"100vh"}>
          <Box padding={2}>
            <Brand type="img" />
          </Box>
          <List>
            {routes
              .filter((route) =>
                user?.type ? route.role.includes(user.type) : false,
              )
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
