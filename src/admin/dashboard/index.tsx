import { Stack, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import ReportCard from "../../components/card/ReportCard";
import { getUserFullName } from "../../utils";
import Frame from "../../components/frame/Frame";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import { useGetUsersQuery } from "../../data/rtk/user";
import { useGetCentersQuery } from "../../data/rtk/center";
import { useGetTransactionsQuery } from "../../data/rtk/transaction";
import { MetricCardSkeleton } from "../../components/query-state/QueryStates";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";

type QuickAction = {
  id: string;
  label: string;
  description: string;
  url: string;
  icon: React.ReactNode;
};

const ADMIN_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "qa-centers",
    label: "Manage Centers",
    description: "Add, edit, or remove center locations",
    url: "/dashboard/manage-centers",
    icon: <SchoolOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    id: "qa-coordinators",
    label: "Coordinators",
    description: "Invite and manage center coordinators",
    url: "/dashboard/coordinators",
    icon: <GroupOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    id: "qa-students",
    label: "All Students",
    description: "Browse all registered students",
    url: "/dashboard/students",
    icon: <PersonAddAlt1OutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    id: "qa-manual-orders",
    label: "Manual Orders",
    description: "Manage manual book orders",
    url: "/dashboard/manual-orders",
    icon: <MenuBookOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    id: "qa-configurations",
    label: "Configurations",
    description: "Registration windows, fees & Zelle",
    url: "/dashboard/configurations/registration",
    icon: <SettingsOutlinedIcon sx={{ fontSize: 22 }} />,
  },
];

const COORDINATOR_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "qa-my-students",
    label: "My Students",
    description: "View students at your center",
    url: "/dashboard/my-students",
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    id: "qa-upload",
    label: "Upload Result",
    description: "Upload a single student result",
    url: "/dashboard/results/upload",
    icon: <CloudUploadOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    id: "qa-bulk-upload",
    label: "Bulk Upload",
    description: "Upload many results at once",
    url: "/dashboard/results/bulk-upload",
    icon: <FileUploadOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    id: "qa-manuals",
    label: "My Manuals",
    description: "Order and view manuals",
    url: "/dashboard/manual-order",
    icon: <LibraryBooksOutlinedIcon sx={{ fontSize: 22 }} />,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin";
  const isCoordinator = user?.type === "coordinator";
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : user?.center?._id;
  const isUnassignedCoordinator = isCoordinator && !coordinatorCenterId;

  const { data: coordinators, isLoading: coordinatorsLoading } =
    useGetUsersQuery({ type: "coordinator" }, { skip: !isAdmin });
  const { data: students, isLoading: studentsLoading } = useGetUsersQuery(
    {
      type: "user",
      ...(isCoordinator && coordinatorCenterId
        ? { center: coordinatorCenterId }
        : {}),
    },
    { skip: isCoordinator && !coordinatorCenterId },
  );
  const { data: centers, isLoading: centersLoading } = useGetCentersQuery(
    { page: 1, limit: 20 },
    { skip: !isAdmin },
  );
  const { data: pendingTxs } = useGetTransactionsQuery(
    { status: "pending" },
    { skip: !isAdmin },
  );
  const pendingApprovalsCount = pendingTxs?.data?.totalItems ?? 0;

  const isStatsLoading = isAdmin
    ? coordinatorsLoading || centersLoading || studentsLoading
    : studentsLoading;
  const statsSkeletonCount = isAdmin ? 3 : 1;

  const quickActions = isAdmin
    ? ADMIN_QUICK_ACTIONS.map((a) =>
        a.id === "qa-configurations" && pendingApprovalsCount > 0
          ? {
              ...a,
              description: `${pendingApprovalsCount} payment${
                pendingApprovalsCount === 1 ? "" : "s"
              } awaiting approval`,
              url: "/dashboard/payments/approvals",
              icon: <HourglassEmptyOutlinedIcon sx={{ fontSize: 22 }} />,
            }
          : a,
      )
    : isCoordinator
      ? COORDINATOR_QUICK_ACTIONS
      : [];

  const hasUnassignedView = isUnassignedCoordinator;

  return (
    <Frame text={`Welcome ${user ? getUserFullName(user) : ""}`}>
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {isStatsLoading ? (
          Array.from({ length: statsSkeletonCount }).map((_, idx) => (
            <MetricCardSkeleton key={idx} />
          ))
        ) : (
          <>
            {isAdmin && (
              <ReportCard
                number={coordinators?.data?.totalItems || 0}
                title="Center Coordinators"
              />
            )}
            {isAdmin && (
              <ReportCard
                number={centers?.data?.totalItems || 0}
                title="Centers"
              />
            )}
            <ReportCard
              title={isCoordinator ? "My Students" : "Students"}
              number={
                isUnassignedCoordinator ? 0 : students?.data?.totalItems || 0
              }
            />
          </>
        )}
      </div>

      {quickActions.length > 0 && (
        <Stack py={4} gap={2}>
          <Typography level="title-lg" sx={{ color: "#001F54" }}>
            Quick Actions
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.url)}
                className="group bg-white border border-[#E6ECFF] hover:border-[#001EC5] hover:shadow-sm rounded-lg p-4 text-left flex items-start gap-3 transition-all"
              >
                <span className="shrink-0 w-10 h-10 rounded-lg bg-[#F0F4FF] text-[#001EC5] flex items-center justify-center group-hover:bg-[#001EC5] group-hover:text-white transition-colors">
                  {action.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#001F54] group-hover:text-[#001EC5]">
                    {action.label}
                  </span>
                  <span className="block text-xs text-[#6B7280] mt-0.5 leading-snug">
                    {action.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Stack>
      )}

      {hasUnassignedView && (
        <div className="mt-12">
          <div className="bg-white border border-[#E6ECFF] rounded-lg p-8 text-center max-w-2xl mx-auto">
            <Typography level="h3" textColor="#001F54" mb={1}>
              You are not assigned to any center yet
            </Typography>
            <Typography level="body-md" textColor="#475569">
              Your coordinator account is active, but no center has been
              assigned. Please contact an admin to complete your center
              assignment.
            </Typography>
          </div>
        </div>
      )}
    </Frame>
  );
};

export default Dashboard;
