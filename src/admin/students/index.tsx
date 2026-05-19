import { Box, Card, Chip, Divider, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppSearch from "../../components/search/AppSearch";
import Frame from "../../components/frame/Frame";
import AvatarText from "../../components/avatar-text/AvatarText";
import { useGetUsersQuery } from "../../data/rtk/user";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import AppButton from "../../components/Button/AppButton";
import AppPagination from "../../components/pagination/Pagination";
import { getUserFullName } from "../../utils";

const StudentsPage = () => {
  const [searchVar, setSearchVar] = useState("");
  const [page, setPage] = useState(1);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchVar]);

  const { data: students, isLoading } = useGetUsersQuery({
    type: "user",
    page,
    limit: 20,
    ...(searchVar ? { search: searchVar } : {}),
  });

  const navigate = useNavigate();
  const studentDocs = students?.data?.docs || [];
  const totalPages = students?.data?.totalPages || 1;

  const getCenterName = (entry: User) => {
    if (!entry?.center || typeof entry.center === "string") return "—";
    return entry.center.name || "—";
  };

  const getPaymentChip = (status?: string) => {
    const s = status || "pending";
    const color =
      s === "paid" ? "success" : s === "failed" ? "danger" : "warning";
    return (
      <Chip
        color={color}
        variant="soft"
        size="sm"
        sx={{ textTransform: "capitalize" }}
      >
        {s}
      </Chip>
    );
  };

  return (
    <Frame text="Students">
      <div className="mt-8 pb-16">
        <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              pb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <div>
              <Typography level="title-lg">All Students</Typography>
              <Typography
                level="body-sm"
                sx={{ mt: 0.5, color: "text.tertiary" }}
              >
                {students?.data?.totalItems ?? 0} registered student
                {(students?.data?.totalItems ?? 0) !== 1 ? "s" : ""}
              </Typography>
            </div>
            <AppSearch searchVar={searchVar} setSearchVar={setSearchVar} />
          </Box>

          <Divider />

          {/* Table */}
          <Box className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left text-[#001F54]">
              <thead className="text-xs whitespace-nowrap bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Matric Number</th>
                  <th className="px-6 py-4 font-semibold">Center</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="whitespace-nowrap">
                {isLoading && studentDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="px-4 py-4">
                        <TableSkeleton columns={5} rows={10} />
                      </div>
                    </td>
                  </tr>
                ) : studentDocs.length ? (
                  studentDocs.map((student: User) => (
                    <tr
                      className="border-b border-[#F3F4F6] last:border-none font-medium hover:bg-[#F8FAFC] transition"
                      key={student._id}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AvatarText text={getUserFullName(student)} />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#6B7280]">
                        {student?.matricNumber || "—"}
                      </td>
                      <td className="px-6 py-4">{getCenterName(student)}</td>
                      <td className="px-6 py-4">
                        {getPaymentChip(student?.paymentStatus)}
                      </td>
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
                    <td colSpan={5}>
                      <CenteredEmptyState description="No students found" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </Box>
          )}
        </Card>
      </div>
    </Frame>
  );
};

export default StudentsPage;
