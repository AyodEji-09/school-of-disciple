import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FormControl, FormLabel, Option, Select, Stack } from "@mui/joy";

import AppSearch from "../../components/search/AppSearch";
import Frame from "../../components/frame/Frame";
import AvatarText from "../../components/avatar-text/AvatarText";
import AppButton from "../../components/Button/AppButton";
import AppPagination from "../../components/pagination/Pagination";
import PageCard from "../../components/feedback/PageCard";
import StatusBadge from "../../components/feedback/StatusBadge";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  EmptyValue,
} from "../../components/feedback/TableShell";
import { useGetUsersQuery } from "../../data/rtk/user";
import { useGetCentersQuery } from "../../data/rtk/center";
import { useGetSessionsQuery } from "../../data/rtk/academic";
import { getUserFullName } from "../../utils";
import { PAYMENT_STATUS } from "../../utils/status";

const StudentsPage = () => {
  const [searchVar, setSearchVar] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const prevFiltersRef = useRef({ searchVar, selectedSessionId, selectedCenter });

  const { data: sessions = [] } = useGetSessionsQuery();

  useEffect(() => {
    if (!initialized) {
      const current = sessions.find((s) => s.isCurrent);
      if (current?._id) {
        setSelectedSessionId(current._id);
        prevFiltersRef.current.selectedSessionId = current._id;
        setInitialized(true);
      }
    }
  }, [sessions, initialized]);

  const { data: centersRes } = useGetCentersQuery({ limit: 100 });
  const centers = centersRes?.data?.docs ?? [];

  useEffect(() => {
    if (!initialized) return;
    const prev = prevFiltersRef.current;
    if (
      prev.searchVar !== searchVar ||
      prev.selectedSessionId !== selectedSessionId ||
      prev.selectedCenter !== selectedCenter
    ) {
      prevFiltersRef.current = { searchVar, selectedSessionId, selectedCenter };
      setSearchParams((prevParams) => {
        const next = new URLSearchParams(prevParams);
        next.delete("page");
        return next;
      });
    }
  }, [searchVar, selectedSessionId, selectedCenter, initialized]);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(newPage));
      }
      return next;
    });
  };

  const { data: students, isLoading } = useGetUsersQuery({
    type: "user",
    page,
    limit: 20,
    ...(selectedSessionId ? { admissionSessionId: selectedSessionId } : {}),
    ...(selectedCenter ? { center: selectedCenter } : {}),
    ...(searchVar ? { search: searchVar } : {}),
  });

  const navigate = useNavigate();
  const studentDocs = students?.data?.docs || [];
  const totalPages = students?.data?.totalPages || 1;
  const totalItems = students?.data?.totalItems || 0;
  const selectedSessionName = sessions.find((s) => s._id === selectedSessionId)?.name;
  const selectedCenterLabel = selectedCenter
    ? (centers.find((center) => center._id === selectedCenter)?.name ??
      "Selected Center")
    : "All Centers";

  const getCenterName = (entry: User) => {
    if (!entry?.center || typeof entry.center === "string") return null;
    return entry.center.name || null;
  };

  return (
    <Frame text="Students">
      <div className="mt-6">
        <PageCard
          title="All Students"
          subtitle={`${totalItems} registered student${totalItems !== 1 ? "s" : ""}${
            selectedSessionName ? ` in ${selectedSessionName}` : ""
          }${selectedCenter ? ` at ${selectedCenterLabel}` : ""}`}
          padded={false}
        >
          <div className="px-6 py-4.5 flex flex-wrap gap-3 items-end">
            <AppSearch searchVar={searchVar} setSearchVar={setSearchVar} />
            <FormControl size="sm" sx={{ minWidth: 180 }}>
              <FormLabel>Admission Session</FormLabel>
              <Select
                size="sm"
                value={selectedSessionId}
                onChange={(_, val) =>
                  setSelectedSessionId((val as string) ?? "")
                }
                placeholder="All Sessions"
              >
                <Option value="">All Sessions</Option>
                {sessions.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl size="sm" sx={{ minWidth: 200 }}>
              <FormLabel>Center</FormLabel>
              <Select
                size="sm"
                value={selectedCenter}
                onChange={(_, val) => setSelectedCenter((val as string) ?? "")}
                placeholder="All Centers"
              >
                <Option value="">All Centers</Option>
                {centers.map((center) => (
                  <Option key={center._id} value={center._id}>
                    {center.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Student</TableHeaderCell>
                  <TableHeaderCell>Matric Number</TableHeaderCell>
                  <TableHeaderCell>Admission Year</TableHeaderCell>
                  <TableHeaderCell>Center</TableHeaderCell>
                  <TableHeaderCell>Payment</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Action
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading && studentDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <TableSkeleton columns={6} rows={10} />
                    </td>
                  </tr>
                ) : studentDocs.length ? (
                  studentDocs.map((student: User) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <AvatarText text={getUserFullName(student)} />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-[#6B7280]">
                          {student?.matricNumber || <EmptyValue />}
                        </span>
                      </TableCell>
                      <TableCell>
                        {student?.admissionYear || <EmptyValue />}
                      </TableCell>
                      <TableCell>
                        {getCenterName(student) ?? <EmptyValue />}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={student?.paymentStatus}
                          map={PAYMENT_STATUS}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <AppButton
                          type="button"
                          className="h-8 px-4 text-xs"
                          onClick={() =>
                            navigate(`/dashboard/students/${student._id}`)
                          }
                        >
                          View
                        </AppButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <CenteredEmptyState description="No students found" />
                    </td>
                  </tr>
                )}
              </TableBody>
            </table>
          </div>

          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ p: 3 }}>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </Stack>
          )}
        </PageCard>
      </div>
    </Frame>
  );
};

export default StudentsPage;
