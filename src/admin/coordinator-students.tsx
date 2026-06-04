import { FormControl, FormLabel, Option, Select, Stack } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppButton from "../components/Button/AppButton";
import AppSearch from "../components/search/AppSearch";
import Frame from "../components/frame/Frame";
import AvatarText from "../components/avatar-text/AvatarText";
import PageCard from "../components/feedback/PageCard";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../components/query-state/QueryStates";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/feedback/TableShell";
import { useAppSelector } from "../data/hooks";
import { selectUser } from "../data/selectors/authSelector";
import { useGetUsersQuery } from "../data/rtk/user";
import {
  useGetAllRegistrationWindowsQuery,
  useGetRegistrationWindowQuery,
} from "../data/rtk/registration";
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
      <div className="mt-6">
        {isUnassigned ? (
          <UnassignedNotice />
        ) : (
          <PageCard
            title="Students"
            subtitle={
              studentDocs.length
                ? `${studentDocs.length} student${studentDocs.length === 1 ? "" : "s"} at your center`
                : undefined
            }
            action={
              <Stack
                direction="row"
                gap={1.5}
                flexWrap="wrap"
                alignItems="end"
              >
                <FormControl size="sm" sx={{ minWidth: 200 }}>
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
            }
            padded={false}
          >
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Student Name</TableHeaderCell>
                    <TableHeaderCell>Matric Number</TableHeaderCell>
                    <TableHeaderCell>Center</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {isLoading && studentDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <TableSkeleton columns={4} rows={5} />
                      </td>
                    </tr>
                  ) : studentDocs.length ? (
                    studentDocs.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>
                          <AvatarText text={getUserFullName(student)} />
                        </TableCell>
                        <TableCell>{student?.matricNumber}</TableCell>
                        <TableCell>{getCenterName(student)}</TableCell>
                        <TableCell>
                          <AppButton
                            type="button"
                            className="h-8 px-4 text-xs"
                            onClick={() =>
                              navigate(
                                `/dashboard/students/${student._id}`,
                              )
                            }
                          >
                            View
                          </AppButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <CenteredEmptyState description="No students found" />
                      </td>
                    </tr>
                  )}
                </TableBody>
              </table>
            </div>
          </PageCard>
        )}
      </div>
    </Frame>
  );
};

const UnassignedNotice = () => {
  return (
    <PageCard padded={false}>
      <div className="p-8 text-center max-w-2xl mx-auto">
        <div className="text-base font-semibold text-[#001F54] mb-1">
          You are not assigned to any center yet
        </div>
        <p className="text-sm text-[#475569] leading-relaxed">
          Your coordinator account is active, but no center has been assigned.
          Please contact an admin to complete your center assignment.
        </p>
      </div>
    </PageCard>
  );
};

export default CoordinatorStudentsPage;
