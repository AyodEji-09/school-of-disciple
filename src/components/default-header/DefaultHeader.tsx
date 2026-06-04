import {
  Avatar,
  Box,
  Button,
  Divider,
  Dropdown,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/joy";
import Profile from "../profile/Profile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PropsWithChildren, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import { capitalizeWords, handleError } from "../../utils";
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

type Props = {
  title?: string;
};

const DefaultHeader = ({
  title = "Dashboard",
  children,
}: PropsWithChildren<Props>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const { data: notificationsRes } = useGetNotificationsQuery(undefined, {
    skip: !user,
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [confirmTransaction] = useConfirmTransactionMutation();
  const [rejectTransaction] = useRejectTransactionMutation();

  const notifications = notificationsRes?.data ?? [];
  const pendingCount = notifications.filter((n: any) => !n.isRead).length;

  const handleConfirm = async (
    transactionId: string,
    notificationId: string,
  ) => {
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

  const handleReject = async (
    transactionId: string,
    notificationId: string,
  ) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return;
    setActionId(transactionId);
    try {
      await rejectTransaction({
        id: transactionId,
        reason: reason || undefined,
      }).unwrap();
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
      name: "Manuals",
      url: "/dashboard/manual-order",
      role: ["coordinator"],
    },
    {
      id: 8,
      name: "Dashboard",
      url: "/my-dashboard",
      role: ["user"],
    },
    {
      id: 9,
      name: "Results",
      url: "/dashboard/results",
      role: ["admin", "coordinator"],
    },
    {
      id: 10,
      name: "My Results",
      url: "/my-dashboard/results",
      role: ["user"],
    },
    {
      id: 11,
      name: "Academic Setup",
      url: "/dashboard/results/setup",
      role: ["admin"],
    },
    {
      id: 12,
      name: "Manual Orders",
      url: "/dashboard/manual-orders",
      role: ["admin", "super"],
    },
  ];

  const visibleRoutes = routes.filter((route) =>
    user?.type ? route.role.includes(user.type) : false,
  );

  const isActive = (url: string) => location.pathname === url;

  const renderBrand = () => (
    <Link to="/">
      <div className="flex items-center gap-2">
        <img
          src="/images/logo.png"
          alt="School of Disciples Logo"
          className="h-10"
        />
        <img src="/images/rcg.png" alt="RCCG Logo" className="h-10" />
      </div>
    </Link>
  );

  const renderNavList = (onNavigate?: () => void) => (
    <List sx={{ "--List-padding": "0.5rem", gap: 1 }}>
      {visibleRoutes.map((route) => {
        const active = isActive(route.url);
        return (
          <ListItem key={route.id} sx={{ p: 0 }}>
            <button
              onClick={() => {
                navigate(route.url);
                onNavigate?.();
              }}
              className={`w-full text-left capitalize h-10 pl-4 pr-3 flex items-center border-l-4 transition-colors ${
                active
                  ? "text-[#001EC5] font-semibold border-[#001EC5]"
                  : "border-transparent text-[#001F54] hover:text-[#001EC5] hover:font-semibold hover:border-[#001EC5]"
              }`}
            >
              {route.name}
            </button>
          </ListItem>
        );
      })}
    </List>
  );

  const renderNotificationBell = () =>
    isAdmin ? (
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
        </MenuButton>
        <Menu
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
              <Typography level="title-sm">Notifications</Typography>
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

          <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
            {notifications.length === 0 ? (
              <Box sx={{ py: 5, px: 3, textAlign: "center" }}>
                <Typography level="body-sm" textColor="neutral.400">
                  All caught up — no new notifications.
                </Typography>
              </Box>
            ) : (
              notifications.map((n: any, idx: number) => {
                const isPendingTx =
                  n.type === "transaction_pending" && !n.isRead;
                const txId = n.transactionId?._id || n.transactionId;
                const receiptUrl = n.transactionId?.zelleReceiptUrl;
                const txCreatedBy = n.transactionId?.createdBy;
                const txCenter = n.transactionId?.center;
                const coordinatorName = txCreatedBy
                  ? `${txCreatedBy.firstName || ""} ${txCreatedBy.lastName || ""}`.trim() ||
                    txCreatedBy.email
                  : null;
                const centerName = txCenter?.name;

                return (
                  <Box
                    key={n._id}
                    sx={{ bgcolor: n.isRead ? "transparent" : "#F0F7FF" }}
                  >
                    {idx > 0 && <Divider />}
                    <Box sx={{ px: 2.5, py: 2 }}>
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

                      {(coordinatorName || centerName) && (
                        <Typography
                          level="body-xs"
                          textColor="neutral.500"
                          sx={{ mb: 0.5 }}
                        >
                          {coordinatorName && (
                            <>
                              <strong>{coordinatorName}</strong>
                              {centerName ? " · " : ""}
                            </>
                          )}
                          {centerName}
                        </Typography>
                      )}

                      <Typography
                        level="body-sm"
                        textColor="neutral.700"
                        sx={{ mb: isPendingTx ? 1.5 : 0.5 }}
                      >
                        {n.message}
                      </Typography>

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

                      {!n.isRead && !isPendingTx && (
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          sx={{ mt: 0.5 }}
                        >
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
    ) : null;

  const renderAvatar = () => (
    <Dropdown>
      <MenuButton sx={{ border: "none", ":hover": { background: "none" } }}>
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
  );

  return (
    <Box bgcolor={"#F5FAFF"} minHeight={"100vh"}>
      <div className="flex min-h-screen">
        {/* Backdrop — shown on all screen sizes when sidebar open */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar — slide-in overlay on all screen sizes */}
        <Box
          component="aside"
          className={`fixed top-0 left-0 z-30 h-screen transition-transform duration-200 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          sx={{
            width: 260,
            flexShrink: 0,
            bgcolor: "white",
            borderRight: "1px solid",
            borderColor: "#E6ECFF",
            overflowY: "auto",
          }}
        >
          <Stack sx={{ width: "100%" }} gap={2} py={3}>
            <Box px={2}>{renderBrand()}</Box>
            <Divider />
            <Box px={1.5} sx={{ flexGrow: 1 }}>
              {renderNavList(() => setMobileOpen(false))}
            </Box>
          </Stack>
        </Box>

        {/* Right column: topbar + content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <Box
            component="header"
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              bgcolor: "white",
              borderBottom: "1px solid",
              borderColor: "#E6ECFF",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              py={1.5}
              px={2}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={1.5}
                sx={{ minWidth: 0 }}
              >
                <IconButton
                  sx={{
                    color: "white",
                    borderRadius: "25px",
                    border: "none",
                    background: "#001EC5",
                  }}
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle navigation"
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  level="title-lg"
                  textColor="#001F54"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {title}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1.5}>
                {renderNotificationBell()}
                {renderAvatar()}
              </Stack>
            </Stack>
          </Box>

          {/* Content */}
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Box className="px-4 py-6 md:px-8 md:py-8">{children}</Box>
          </Box>
        </div>
      </div>
    </Box>
  );
};

export default DefaultHeader;
