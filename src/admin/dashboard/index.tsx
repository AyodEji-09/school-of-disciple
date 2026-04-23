import { Stack, Typography } from "@mui/joy";
import ReportCard from "../../components/card/ReportCard";
import AppButton from "../../components/Button/AppButton";
import { useNavigate } from "react-router-dom";
import { getUserFullName } from "../../utils";
import AppSearch from "../../components/search/AppSearch";
import Frame from "../../components/frame/Frame";
import AvatarText from "../../components/avatar-text/AvatarText";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import { useGetUsersQuery } from "../../data/rtk/user";
import { useGetCentersQuery } from "../../data/rtk/center";
import {
  CenteredEmptyState,
  MetricCardSkeleton,
  TableSkeleton,
} from "../../components/query-state/QueryStates";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isCoordinator = user?.type === "coordinator";
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : user?.center?._id;
  console.log({ user });
  const { data: coordinators, isLoading: coordinatorsLoading } =
    useGetUsersQuery({ type: "coordinator" }, { skip: isCoordinator });
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
    { skip: isCoordinator },
  );
  console.log({ coordinators, students, centers });

  const isStatsLoading =
    user?.type === "admin"
      ? coordinatorsLoading || centersLoading || studentsLoading
      : studentsLoading;
  const statsSkeletonCount = user?.type === "admin" ? 3 : 1;

  return (
    <Frame text={`Welcome ${user ? getUserFullName(user) : ""}`}>
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {isStatsLoading ? (
          Array.from({ length: statsSkeletonCount }).map((_, idx) => (
            <MetricCardSkeleton key={idx} />
          ))
        ) : (
          <>
            {user?.type === "admin" && (
              <ReportCard
                number={coordinators?.data?.totalItems || 0}
                title="Center Coordinators"
              />
            )}
            {user?.type === "admin" && (
              <ReportCard
                number={centers?.data?.totalItems || 0}
                title="Centers"
              />
            )}
            <ReportCard
              title="Students"
              number={students?.data?.totalItems || 0}
            />
          </>
        )}
      </div>
      {user?.type === "admin" && (
        <Stack py={4}>
          <div className="w-fit ml-auto flex gap-4 flex-wrap">
            <AppButton
              variant="outlined"
              onClick={() => navigate("/manage-centers")}
            >
              Add Center
            </AppButton>
            <AppButton
              variant="outlined"
              onClick={() => navigate("/dashboard/add-manager")}
            >
              Add Center Manager
            </AppButton>
          </div>
        </Stack>
      )}
      <div className="mt-12">
        {user?.type === "coordinator" ? (
          <StudentsTable centerId={coordinatorCenterId} />
        ) : (
          <CenterCoordinatorTable />
        )}
      </div>
    </Frame>
  );
};

export default Dashboard;

const CenterCoordinatorTable = () => {
  const navigate = useNavigate();
  const { data: coordinators, isLoading } = useGetUsersQuery({
    type: "coordinator",
  });
  console.log({ coordinators });
  const coordinatorDocs = coordinators?.data?.docs || [];

  const getCenterName = (entry: User) => {
    if (!entry?.center || typeof entry.center === "string") return "-";
    return entry.center.name || "-";
  };

  return (
    <div className="grid gap-4 pb-16">
      <div className="bg-white p-4 overflow-x-auto">
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={4}
        >
          <Typography level="title-lg" mb={4}>
            Center Coordinators
          </Typography>
          <AppSearch />
        </Stack>
        <div className={"overflow-x-auto w-full"}>
          <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
            <thead className="text-xs whitespace-nowrap">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Center
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && coordinatorDocs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton columns={5} rows={5} />
                  </td>
                </tr>
              ) : coordinatorDocs.length ? (
                coordinatorDocs.map((coordinator, idx) => (
                  <tr
                    className="border-b last:border-none font-medium"
                    key={idx}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AvatarText text={getUserFullName(coordinator)} />
                    </td>
                    <td className="px-6 py-4">{coordinator?.phone}</td>
                    <td className="px-6 py-4">{getCenterName(coordinator)}</td>
                    <td className="px-6 py-4">{coordinator?.email}</td>
                    <td className="px-6 py-4">
                      <AppButton
                        onClick={() =>
                          navigate(`/dashboard/manager/${coordinator._id}`)
                        }
                      >
                        View
                      </AppButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <CenteredEmptyState description="No coordinators found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* <div className="hidden md:block bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-1.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-2.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-3.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="col-span-2">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-4.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

const StudentsTable = ({ centerId }: { centerId?: string }) => {
  const { data: students, isLoading } = useGetUsersQuery(
    {
      type: "user",
      ...(centerId ? { center: centerId } : {}),
    },
    { skip: !centerId },
  );
  console.log({ students });
  const navigate = useNavigate();
  const studentDocs = students?.data?.docs || [];

  const getCenterName = (entry: User) => {
    if (!entry?.center || typeof entry.center === "string") return "-";
    return entry.center.name || "-";
  };

  return (
    <div className="pb-16">
      <div className="bg-white p-4 overflow-x-auto">
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={4}
        >
          <Typography level="title-lg" mb={4}>
            Students
          </Typography>
          <AppSearch />
        </Stack>
        <div className={"overflow-x-auto w-full"}>
          <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
            <thead className="text-xs whitespace-nowrap">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Student Matric Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Center
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && studentDocs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <TableSkeleton columns={4} rows={5} />
                  </td>
                </tr>
              ) : studentDocs.length ? (
                studentDocs.map((student, idx) => (
                  <tr
                    className="border-b last:border-none font-medium"
                    key={idx}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AvatarText text={getUserFullName(student)} />
                    </td>
                    <td className="px-6 py-4">{student?.matricNumber}</td>
                    <td className="px-6 py-4">{getCenterName(student)}</td>
                    <td className="px-6 py-4">
                      <AppButton
                        onClick={() =>
                          navigate(`/dashboard/students/${student._id}`)
                        }
                      >
                        View
                      </AppButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <CenteredEmptyState description="No students found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
