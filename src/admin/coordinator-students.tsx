import {
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppButton from "../components/Button/AppButton";
import AppSearch from "../components/search/AppSearch";
import Frame from "../components/frame/Frame";
import AvatarText from "../components/avatar-text/AvatarText";
import { useAppSelector } from "../data/hooks";
import { selectUser } from "../data/selectors/authSelector";
import { useGetUsersQuery } from "../data/rtk/user";
import {
  useGetAllRegistrationWindowsQuery,
  useGetRegistrationWindowQuery,
} from "../data/rtk/registration";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../components/query-state/QueryStates";
import { getUserFullName } from "../utils";

const CoordinatorStudentsPage = () => {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : user?.center?._id;
  const isUnassigned = !coordinatorCenterId;

  const [searchVar, setSearchVar] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  const { data: allWindowsRes } = useGetAllRegistrationWindowsQuery({
    page: 1,
    limit: 100,
  });
  const { data: currentWindowRes } = useGetRegistrationWindowQuery();

  useEffect(() => {
    if (!initialized && currentWindowRes?.data?.label) {
      setSelectedAcademicYear(currentWindowRes.data.label);
      setInitialized(true);
    }
  }, [currentWindowRes, initialized]);

  const academicYears = allWindowsRes?.data?.docs?.map((w) => w.label) ?? [];

  const { data: students, isLoading } = useGetUsersQuery(
    {
      type: "user",
      ...(coordinatorCenterId ? { center: coordinatorCenterId } : {}),
      ...(selectedAcademicYear ? { academicYear: selectedAcademicYear } : {}),
      ...(searchVar ? { search: searchVar } : {}),
    },
    { skip: isUnassigned },
  );

  const studentDocs = students?.data?.docs || [];

  const getCenterName = (entry: User) => {
    if (!entry?.center || typeof entry.center === "string") return "—";
    return entry.center.name || "—";
  };

  return (
    <Frame text="My Students">
      <div className="pb-16 mt-8">
        {isUnassigned ? (
          <UnassignedNotice />
        ) : (
          <div className="bg-white p-4 overflow-x-auto border border-[#E6ECFF] rounded-lg">
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
              gap={4}
              flexWrap="wrap"
              mb={2}
            >
              <Typography level="title-lg">Students</Typography>

              <Stack
                direction="row"
                gap={1.5}
                flexWrap="wrap"
                alignItems="end"
              >
                <FormControl size="sm" sx={{ minWidth: 220 }}>
                  <FormLabel>Academic Year</FormLabel>
                  <Select
                    size="sm"
                    value={selectedAcademicYear}
                    onChange={(_, val) =>
                      setSelectedAcademicYear((val as string) ?? "")
                    }
                    placeholder="All Years"
                  >
                    <Option value="">All Years</Option>
                    {academicYears.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
                <AppSearch
                  searchVar={searchVar}
                  setSearchVar={setSearchVar}
                />
              </Stack>
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
                <tbody className="whitespace-nowrap">
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
                        <td className="px-6 py-4">
                          {student?.matricNumber}
                        </td>
                        <td className="px-6 py-4">{getCenterName(student)}</td>
                        <td className="px-6 py-4">
                          <AppButton
                            onClick={() =>
                              navigate(
                                `/dashboard/students/${student._id}`,
                              )
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
        )}
      </div>
    </Frame>
  );
};

const UnassignedNotice = () => {
  return (
    <div className="bg-white border border-[#E6ECFF] rounded-lg p-8 text-center max-w-2xl mx-auto">
      <Typography level="h3" textColor="#001F54" mb={1}>
        You are not assigned to any center yet
      </Typography>
      <Typography level="body-md" textColor="#475569">
        Your coordinator account is active, but no center has been assigned.
        Please contact an admin to complete your center assignment.
      </Typography>
    </div>
  );
};

export default CoordinatorStudentsPage;
