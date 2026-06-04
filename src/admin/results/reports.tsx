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
  useGetSessionsQuery,
  useGetTermsQuery,
} from "../../data/rtk/academic";
import { useGetCentersQuery } from "../../data/rtk/center";
import { handleError } from "../../utils";
import { toast } from "react-toastify";
import { gradeColor } from "../../utils/academic";
import axios from "axios";
import { TOKEN } from "../../data/config";
import PageCard from "../../components/feedback/PageCard";
import {
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/feedback/TableShell";

const ReportsPage = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");
  const [centerId, setCenterId] = useState(coordinatorCenterId ?? "");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: sessionsRes } = useGetSessionsQuery();
  const { data: termsRes } = useGetTermsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId },
  );
  const { data: centersRes } = useGetCentersQuery(
    { page: 1, limit: 100 },
    { skip: !isAdmin },
  );
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];
  const centers = centersRes?.data?.docs ?? [];

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
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Frame text="Academic Reports">
      <div className="space-y-6 mt-6 pb-16">
        <PageCard title="Generate Report">
          <Stack direction="row" gap={3} flexWrap="wrap" alignItems="flex-end">
            <FormControl size="sm" sx={{ minWidth: 200 }}>
              <FormLabel>Session *</FormLabel>
              <Select
                placeholder="Select session"
                value={sessionId}
                onChange={(_, v) => setSessionId(v as string)}
              >
                {sessions.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl size="sm" sx={{ minWidth: 180 }}>
              <FormLabel>Term</FormLabel>
              <Select
                placeholder="Select term"
                value={termId}
                onChange={(_, v) => setTermId(v as string)}
              >
                {terms.map((t) => (
                  <Option key={t._id} value={t._id}>
                    {t.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
            {isAdmin ? (
              <FormControl size="sm" sx={{ minWidth: 220 }}>
                <FormLabel>Centre</FormLabel>
                <Select
                  placeholder="Select centre"
                  value={centerId}
                  onChange={(_, v) => setCenterId(v as string)}
                >
                  <Option value="">All centres (Global)</Option>
                  {centers.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            <Stack direction="row" gap={2} flexWrap="wrap">
              <AppButton onClick={fetchCenterReport} loading={loading}>
                {isAdmin ? "Centre Report" : "My Centre Report"}
              </AppButton>
              {isAdmin && (
                <AppButton
                  variant="outlined"
                  onClick={fetchGlobalReport}
                  loading={loading}
                >
                  Global Report
                </AppButton>
              )}
            </Stack>
          </Stack>
        </PageCard>

        {loading && (
          <div className="flex justify-center py-16">
            <CircularProgress />
          </div>
        )}

        {report && !loading && (
          <div className="grid gap-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Students", value: report.data.totalStudents ?? 0 },
                {
                  label: "Average Score",
                  value: `${(report.data.averageScore ?? 0).toFixed(1)}%`,
                },
                {
                  label: "Pass Rate",
                  value: `${(report.data.passRate ?? 0).toFixed(1)}%`,
                },
                {
                  label: report.type === "global" ? "Centres" : "Subjects",
                  value:
                    report.type === "global"
                      ? (report.data.centers?.length ?? 0)
                      : (report.data.subjectSummaries?.length ?? 0),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white border border-[#E6ECFF] rounded-2xl p-5 shadow-sm"
                >
                  <Typography level="body-xs" textColor="#6B7280">
                    {label}
                  </Typography>
                  <Typography
                    level="h3"
                    sx={{ fontWeight: 800, color: "#001F54", mt: 0.5 }}
                  >
                    {value}
                  </Typography>
                </div>
              ))}
            </div>

            {report.type === "center" &&
              report.data.subjectSummaries?.length > 0 && (
                <PageCard
                  padded={false}
                  title={`Subject Summaries — ${report.data.center?.name}`}
                >
                  <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm">
                      <TableHeader>
                        <tr>
                          <TableHeaderCell>Subject</TableHeaderCell>
                          <TableHeaderCell className="text-center">
                            Students
                          </TableHeaderCell>
                          <TableHeaderCell className="text-center">
                            Average
                          </TableHeaderCell>
                          <TableHeaderCell className="text-center">
                            Highest
                          </TableHeaderCell>
                          <TableHeaderCell className="text-center">
                            Lowest
                          </TableHeaderCell>
                          <TableHeaderCell>Grades</TableHeaderCell>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {report.data.subjectSummaries.map((s: any) => (
                          <TableRow key={s.subjectId}>
                            <TableCell>{s.subjectName}</TableCell>
                            <TableCell className="text-center">
                              {s.totalStudents}
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              <span
                                style={{
                                  color:
                                    s.averageScore >= 50
                                      ? "#16a34a"
                                      : "#dc2626",
                                }}
                              >
                                {s.averageScore.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-green-600 font-semibold">
                              {s.highestScore}
                            </TableCell>
                            <TableCell className="text-center text-red-500 font-semibold">
                              {s.lowestScore}
                            </TableCell>
                            <TableCell>
                              {Object.entries(s.gradeDistribution ?? {})
                                .sort()
                                .map(([g, c]) => (
                                  <span
                                    key={g}
                                    className="mr-2 text-xs font-semibold"
                                    style={{ color: gradeColor(g) }}
                                  >
                                    {g}:{c as number}
                                  </span>
                                ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </table>
                  </div>
                </PageCard>
              )}

            {report.type === "global" && report.data.centers?.length > 0 && (
              <PageCard padded={false} title="All Centres — Global Report">
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-sm">
                    <TableHeader>
                      <tr>
                        <TableHeaderCell>Rank</TableHeaderCell>
                        <TableHeaderCell>Centre</TableHeaderCell>
                        <TableHeaderCell className="text-center">
                          Students
                        </TableHeaderCell>
                        <TableHeaderCell className="text-center">
                          Average
                        </TableHeaderCell>
                        <TableHeaderCell className="text-center">
                          Pass Rate
                        </TableHeaderCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {[...report.data.centers]
                        .sort((a: any, b: any) => b.averageScore - a.averageScore)
                        .map((c: any, idx: number) => (
                          <TableRow key={c.centerId ?? idx}>
                            <TableCell>
                              <span className="text-[#94A3B8] font-bold">
                                #{idx + 1}
                              </span>
                            </TableCell>
                            <TableCell>
                              {c.center?.name ?? c.centerName}
                            </TableCell>
                            <TableCell className="text-center">
                              {c.totalStudents}
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              <span
                                style={{
                                  color:
                                    c.averageScore >= 50
                                      ? "#16a34a"
                                      : "#dc2626",
                                }}
                              >
                                {c.averageScore?.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-bold text-[#001EC5]">
                              {c.passRate?.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </table>
                </div>
              </PageCard>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
};

export default ReportsPage;
