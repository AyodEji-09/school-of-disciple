import { useEffect, useState } from "react";
import {
  Select,
  Option,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  CircularProgress,
} from "@mui/joy";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetSessionsQuery, useGetTermsQuery,
} from "../../data/rtk/academic";
import { useGetCentersQuery } from "../../data/rtk/center";
import { handleError } from "../../utils";
import { toast } from "react-toastify";
import { gradeColor } from "../../utils/academic";
import { FileDownload } from "@mui/icons-material";
import axios from "axios";
import { TOKEN } from "../../data/config";

const ReportsPage = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";
  const coordinatorCenterId = typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");
  const [centerId, setCenterId] = useState(coordinatorCenterId ?? "");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: sessionsRes } = useGetSessionsQuery();
  const { data: termsRes } = useGetTermsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId }
  );
  const { data: centersRes } = useGetCentersQuery({ page: 1, limit: 100 }, { skip: !isAdmin });
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];
  const centers = centersRes?.data?.docs ?? [];

  // Default to current session and current term
  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const current = sessions.find((s) => (s as any).isCurrent) || sessions[0];
      if (current) setSessionId(current._id);
    }
  }, [sessions, sessionId]);

  useEffect(() => {
    if (terms.length > 0 && !termId) {
      const current = terms.find((t) => (t as any).isCurrent) || terms[0];
      if (current) setTermId(current._id);
    }
  }, [terms, termId]);

  const fetchCenterReport = async () => {
    if (!sessionId || !termId) return toast.error("Select both session and term");
    if (!centerId) return toast.error("Select a centre");
    setLoading(true);
    try {
      const res = await axios.get(`/academic/reports/center/${centerId}`, {
        params: { sessionId, termId },
        headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN)}` },
      });
      setReport({ type: "center", data: res.data.data });
    } catch (err) { toast.error(handleError(err)); }
    finally { setLoading(false); }
  };

  const fetchGlobalReport = async () => {
    if (!sessionId) return toast.error("Select a session");
    setLoading(true);
    try {
      const res = await axios.get(`/academic/reports/global`, {
        params: { sessionId, ...(termId ? { termId } : {}) },
        headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN)}` },
      });
      setReport({ type: "global", data: res.data.data });
    } catch (err) { toast.error(handleError(err)); }
    finally { setLoading(false); }
  };

  return (
    <Frame text="Academic Reports">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-[#E6ECFF] shadow-sm p-6 mt-4">
        <Typography level="title-md" mb={4}>Generate Report</Typography>
        <Stack direction="row" gap={3} flexWrap="wrap" alignItems="flex-end">
          <FormControl size="sm" sx={{ minWidth: 200 }}>
            <FormLabel>Session *</FormLabel>
            <Select placeholder="Select session" value={sessionId} onChange={(_, v) => setSessionId(v as string)}>
              {sessions.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
            </Select>
          </FormControl>
          <FormControl size="sm" sx={{ minWidth: 180 }}>
            <FormLabel>Term</FormLabel>
            <Select placeholder="Select term" value={termId} onChange={(_, v) => setTermId(v as string)}>
              {terms.map((t) => <Option key={t._id} value={t._id}>{t.name}</Option>)}
            </Select>
          </FormControl>
          {isAdmin ? (
            <FormControl size="sm" sx={{ minWidth: 220 }}>
              <FormLabel>Centre</FormLabel>
              <Select placeholder="Select centre" value={centerId} onChange={(_, v) => setCenterId(v as string)}>
                <Option value="">All centres (Global)</Option>
                {centers.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
              </Select>
            </FormControl>
          ) : null}

          <Stack direction="row" gap={2} flexWrap="wrap">
            <AppButton onClick={fetchCenterReport} loading={loading}>
              {isAdmin ? "Centre Report" : "My Centre Report"}
            </AppButton>
            {isAdmin && (
              <AppButton variant="outlined" onClick={fetchGlobalReport} loading={loading}>
                Global Report
              </AppButton>
            )}
          </Stack>
        </Stack>
      </div>

      {/* Report output */}
      {loading && (
        <div className="flex justify-center py-16"><CircularProgress /></div>
      )}

      {report && !loading && (
        <div className="mt-6 grid gap-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: report.data.totalStudents ?? 0 },
              { label: "Average Score", value: `${(report.data.averageScore ?? 0).toFixed(1)}%` },
              { label: "Pass Rate", value: `${(report.data.passRate ?? 0).toFixed(1)}%` },
              { label: report.type === "global" ? "Centres" : "Subjects", value: report.type === "global" ? (report.data.centers?.length ?? 0) : (report.data.subjectSummaries?.length ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-[#E6ECFF] rounded-2xl p-5 shadow-sm">
                <Typography level="body-xs" textColor="neutral.500">{label}</Typography>
                <Typography level="h3" fontWeight={800} textColor="#001F54" mt={0.5}>{value}</Typography>
              </div>
            ))}
          </div>

          {/* Centre report: subject summaries */}
          {report.type === "center" && report.data.subjectSummaries?.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E6ECFF] shadow-sm overflow-x-auto">
              <div className="px-6 py-4 border-b border-[#E6ECFF]">
                <Typography level="title-md">Subject Summaries — {report.data.center?.name}</Typography>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#F5FAFF] text-xs text-[#475569] uppercase">
                  <tr>
                    <th className="px-5 py-3 text-left">Subject</th>
                    <th className="px-5 py-3 text-center">Students</th>
                    <th className="px-5 py-3 text-center">Average</th>
                    <th className="px-5 py-3 text-center">Highest</th>
                    <th className="px-5 py-3 text-center">Lowest</th>
                    <th className="px-5 py-3">Grades</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.subjectSummaries.map((s: any) => (
                    <tr key={s.subjectId} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3 font-medium">{s.subjectName}</td>
                      <td className="px-5 py-3 text-center">{s.totalStudents}</td>
                      <td className="px-5 py-3 text-center font-bold" style={{ color: s.averageScore >= 50 ? "#16a34a" : "#dc2626" }}>
                        {s.averageScore.toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 text-center text-green-600 font-semibold">{s.highestScore}</td>
                      <td className="px-5 py-3 text-center text-red-500 font-semibold">{s.lowestScore}</td>
                      <td className="px-5 py-3">
                        {Object.entries(s.gradeDistribution ?? {}).sort().map(([g, c]) => (
                          <span key={g} className="mr-2 text-xs font-semibold" style={{ color: gradeColor(g) }}>
                            {g}:{c as number}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Global report: centre list */}
          {report.type === "global" && report.data.centers?.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E6ECFF] shadow-sm overflow-x-auto">
              <div className="px-6 py-4 border-b border-[#E6ECFF]">
                <Typography level="title-md">All Centres — Global Report</Typography>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#F5FAFF] text-xs text-[#475569] uppercase">
                  <tr>
                    <th className="px-5 py-3 text-left">Rank</th>
                    <th className="px-5 py-3 text-left">Centre</th>
                    <th className="px-5 py-3 text-center">Students</th>
                    <th className="px-5 py-3 text-center">Average</th>
                    <th className="px-5 py-3 text-center">Pass Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[...report.data.centers]
                    .sort((a: any, b: any) => b.averageScore - a.averageScore)
                    .map((c: any, idx: number) => (
                      <tr key={c.centerId ?? idx} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                        <td className="px-5 py-3 text-[#94a3b8] font-bold">#{idx + 1}</td>
                        <td className="px-5 py-3 font-medium">{c.center?.name ?? c.centerName}</td>
                        <td className="px-5 py-3 text-center">{c.totalStudents}</td>
                        <td className="px-5 py-3 text-center font-bold" style={{ color: c.averageScore >= 50 ? "#16a34a" : "#dc2626" }}>
                          {c.averageScore?.toFixed(1)}%
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-[#001EC5]">{c.passRate?.toFixed(1)}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Frame>
  );
};

export default ReportsPage;
