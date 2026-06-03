import { Chip, Typography, Stack, Select, Option, FormControl, FormLabel } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Frame from "../components/frame/Frame";
import { useGetMyResultsQuery, useGetSessionsQuery } from "../data/rtk/academic";
import { STATUS_COLOR, resolveName } from "../utils/academic";
import { CenteredEmptyState, TableSkeleton } from "../components/query-state/QueryStates";
import moment from "moment";
import { FileDownload, Visibility } from "@mui/icons-material";
import { TOKEN } from "../data/config";

import { useURL } from "../data/config";

const MyResultsPage = () => {
  const navigate = useNavigate();
  const { data: res, isLoading } = useGetMyResultsQuery();
  const { data: sessionsRes } = useGetSessionsQuery();
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];
  const [sessionFilter, setSessionFilter] = useState("");

  let results = (res?.data as unknown as StudentResult[]) ?? [];
  if (sessionFilter) {
    results = results.filter((r) => {
      const sid = typeof r.sessionId === "string" ? r.sessionId : (r.sessionId as any)?._id;
      return sid === sessionFilter;
    });
  }

  const handleDownload = (id: string) => {
    const token = localStorage.getItem(TOKEN);
    window.open(`${useURL}/academic/results/${id}/pdf?token=${token}`, "_blank");
  };

  return (
    <Frame text="My Academic Results">
      {/* Filter */}
      <Stack direction="row" gap={2} mt={5} alignItems="flex-end" justifyContent="space-between" flexWrap="wrap">
        <Typography level="title-lg">Result History</Typography>
        <FormControl size="sm" sx={{ minWidth: 200 }}>
          <FormLabel>Filter by Session</FormLabel>
          <Select placeholder="All sessions" value={sessionFilter} onChange={(_, v) => setSessionFilter(v as string)}>
            <Option value="">All sessions</Option>
            {sessions.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
          </Select>
        </FormControl>
      </Stack>

      {/* Results grid */}
      <div className="mt-4 grid gap-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#E6ECFF]">
            <TableSkeleton columns={5} rows={4} />
          </div>
        ) : results.length === 0 ? (
          <CenteredEmptyState description="No published results yet. Results will appear here once your coordinator publishes them." />
        ) : (
          results.map((r) => {
            const session = r.sessionId as any;
            const term = r.termId as any;
            const isAccessible = r.status === "published" || r.status === "locked";
            return (
              <div
                key={r._id}
                className="bg-white border border-[#E6ECFF] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
                  <div>
                    <Typography level="title-md" textColor="#001F54" mb={0.5}>
                      {session?.name} — {term?.name}
                    </Typography>
                    <Typography level="body-sm" textColor="neutral.500">
                      Centre: {resolveName(r.centerId as any)} · {moment(r.publishedAt ?? r.createdAt).format("DD MMM YYYY")}
                    </Typography>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    {isAccessible && (
                      <Stack direction="row" gap={1.5}>
                        <button
                          onClick={() => navigate(`/my-dashboard/results/${r._id}`)}
                          className="flex items-center gap-1 text-sm font-medium text-[#001EC5] hover:underline"
                        >
                          <Visibility sx={{ fontSize: 15 }} /> View
                        </button>
                        <span className="text-[#CBD5E1]">·</span>
                        <button
                          onClick={() => handleDownload(r._id)}
                          className="flex items-center gap-1 text-sm font-medium text-[#475569] hover:text-[#001F54]"
                        >
                          <FileDownload sx={{ fontSize: 15 }} /> PDF
                        </button>
                      </Stack>
                    )}
                  </div>
                </Stack>
              </div>
            );
          })
        )}
      </div>
    </Frame>
  );
};


export default MyResultsPage;
