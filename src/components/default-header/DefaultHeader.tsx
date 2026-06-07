import {
  Avatar,
  Box,
  Button,
  Divider,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/joy";
import Profile from "../profile/Profile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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

type NavItem = {
  id: string;
  name: string;
  url: string;
  role: Array<"admin" | "super" | "coordinator" | "user">;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

type Props = {
  title?: string;
};

const topLevelItems: NavItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    url: "/dashboard",
    role: ["admin", "coordinator"],
  },
  {
    id: "my-students",
    name: "My Students",
    url: "/dashboard/my-students",
    role: ["coordinator"],
  },
  {
    id: "my-dashboard",
    name: "Dashboard",
    url: "/my-dashboard",
    role: ["user"],
  },
  {
    id: "my-results",
    name: "My Results",
    url: "/my-dashboard/results",
    role: ["user"],
  },
];

const navGroups: NavGroup[] = [
  {
    id: "centers",
    label: "Centers & People",
    items: [
      {
        id: "centers-list",
        name: "Manage Centers",
        url: "/dashboard/manage-centers",
        role: ["admin"],
      },
      {
        id: "coordinators-list",
        name: "Coordinators",
        url: "/dashboard/coordinators",
        role: ["admin"],
      },
      {
        id: "students-list",
        name: "Students",
        url: "/dashboard/students",
        role: ["admin"],
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    items: [
      {
        id: "student-payments",
        name: "Student Payments",
        url: "/dashboard/payments",
        role: ["admin", "coordinator"],
      },
      {
        id: "remittances-admin",
        name: "Coordinator Remittances",
        url: "/dashboard/payments/remittances",
        role: ["admin"],
      },
      {
        id: "approvals",
        name: "Pending Approvals",
        url: "/dashboard/payments/approvals",
        role: ["admin"],
      },
      {
        id: "remittances-coord",
        name: "My Remittances",
        url: "/dashboard/credit-admin",
        role: ["coordinator"],
      },
      {
        id: "manual-orders",
        name: "Manual Orders",
        url: "/dashboard/manual-orders",
        role: ["admin", "super"],
      },
    ],
  },
  {
    id: "manuals",
    label: "Manuals",
    items: [
      {
        id: "my-manuals",
        name: "Order History",
        url: "/dashboard/manual-order",
        role: ["coordinator"],
      },
      {
        id: "order-new",
        name: "Order New",
        url: "/dashboard/manual-order/new",
        role: ["coordinator"],
      },
    ],
  },
  {
    id: "results",
    label: "Results",
    items: [
      {
        id: "all-results",
        name: "All Results",
        url: "/dashboard/results",
        role: ["admin", "coordinator"],
      },
      {
        id: "upload",
        name: "Upload Result",
        url: "/dashboard/results/upload",
        role: ["coordinator"],
      },
      {
        id: "bulk-upload",
        name: "Bulk Upload",
        url: "/dashboard/results/bulk-upload",
        role: ["coordinator"],
      },
      {
        id: "coordinator-reports",
        name: "My Reports",
        url: "/coordinator/reports",
        role: ["coordinator"],
      },
      {
        id: "analytics",
        name: "Analytics",
        url: "/dashboard/results/analytics",
        role: ["admin"],
      },
      {
        id: "reports",
        name: "Reports",
        url: "/dashboard/results/reports",
        role: ["admin"],
      },
    ],
  },
  {
    id: "configurations",
    label: "Configurations",
    items: [
      {
        id: "config-academic-setup",
        name: "Academic Setup",
        url: "/dashboard/academics/setup",
        role: ["admin"],
      },
      {
        id: "config-registration",
        name: "Registration Windows",
        url: "/dashboard/configurations/registration",
        role: ["admin", "super"],
      },
      {
        id: "config-fees",
        name: "Fees",
        url: "/dashboard/configurations/fees",
        role: ["admin"],
      },
      {
        id: "config-zelle",
        name: "Zelle Details",
        url: "/dashboard/configurations/zelle",
        role: ["admin"],
      },
    ],
  },
];

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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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

  const visibleTopLevel = useMemo<NavItem[]>(() => {
    if (!user?.type) return [];
    return topLevelItems.filter((item) => item.role.includes(user.type!));
  }, [user?.type]);

  const visibleGroups = useMemo<NavGroup[]>(() => {
    if (!user?.type) return [];
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.role.includes(user.type!)),
      }))
      .filter((group) => group.items.length > 0);
  }, [user?.type]);

  const isActive = (url: string) => location.pathname === url;

  useEffect(() => {
    const activeGroup = visibleGroups.find((group) =>
      group.items.some((item) => isActive(item.url)),
    );
    if (activeGroup) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleGroups, location.pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

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
    <Stack sx={{ width: "100%" }} gap={1} py={1}>
      {visibleTopLevel.length > 0 && (
        <Box sx={{ px: 1.5 }}>
          <Stack sx={{ gap: 0.5 }}>
            {visibleTopLevel.map((item) => {
              const active = isActive(item.url);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.url);
                    onNavigate?.();
                  }}
                  className={`w-full text-left cursor-pointer capitalize h-9 pl-3 pr-3 flex items-center border-l-4 text-sm transition-colors ${
                    active
                      ? "text-[#001EC5] font-semibold border-[#001EC5]"
                      : "border-transparent text-[#001F54] hover:text-[#001EC5] hover:border-[#001EC5]"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </Stack>
        </Box>
      )}
      {visibleGroups.map((group) => {
        const isOpen = openGroups[group.id] ?? false;
        return (
          <Box key={group.id} sx={{ px: 1.5 }}>
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between text-sm text-[#001F54] cursor-pointer transition-colors px-3 h-9"
            >
              <span>{group.label}</span>
              <KeyboardArrowDownIcon
                sx={{
                  fontSize: 18,
                  transition: "transform 150ms",
                  transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                }}
              />
            </button>
            {isOpen && (
              <Stack sx={{ gap: 0.5 }} pt={0.5}>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.url);
                        onNavigate?.();
                      }}
                      className={`w-full text-left cursor-pointer capitalize h-9 pl-3 pr-3 ml-3 flex items-center border-l-4 text-sm transition-colors ${
                        active
                          ? "text-[#001EC5] font-semibold border-[#001EC5]"
                          : "border-transparent text-[#001F54] hover:text-[#001EC5] hover:border-[#001EC5]"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </Stack>
            )}
          </Box>
        );
      })}
    </Stack>
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
                              <strong>
                                {capitalizeWords(coordinatorName)}
                              </strong>
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
            onClick={() => navigate("/dashboard/payments/approvals")}
            sx={{
              justifyContent: "center",
              color: "#001EC5",
              fontWeight: 600,
              fontSize: 13,
              py: 1.5,
              flexShrink: 0,
            }}
          >
            View All Pending Payments →
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
        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <Box
          component="aside"
          className={`fixed top-0 left-0 z-30 h-screen transition-transform duration-200 ease-in-out [&::-webkit-scrollbar]:hidden [scrollbar-width:none] ${
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
            <Box sx={{ flexGrow: 1 }}>
              {renderNavList(() => setMobileOpen(false))}
            </Box>
          </Stack>
        </Box>

        <div className="flex-1 min-w-0 flex flex-col">
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

          <Box component="main" sx={{ flexGrow: 1 }}>
            <Box className="px-4 py-6 md:px-8 md:py-8">{children}</Box>
          </Box>
        </div>
      </div>
    </Box>
  );
};

export default DefaultHeader;
