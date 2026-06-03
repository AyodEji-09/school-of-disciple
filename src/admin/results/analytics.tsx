import { Select, Option, Typography, Stack, FormControl, FormLabel, CircularProgress } from "@mui/joy";
import { useEffect, useState } from "react";
import Frame from "../../components/frame/Frame";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetSessionsQuery, useGetTermsQuery,
  useGetSubjectAnalyticsQuery, useGetSystemAnalyticsQuery,
  useGetStudentPerformanceQuery,
} from "../../data/rtk/academic";
import { gradeColor } from "../../utils/academic";

// ── Small metric card ────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-white border border-[#E6ECFF] rounded-2xl p-5 shadow-sm">
    <Typography level="body-xs" textColor="neutral.500">{label}</Typography>
    <Typography level="h3" fontWeight={800} textColor="#001F54" mt={0.5}>{value}</Typography>
    {sub && <Typography level="body-xs" textColor="neutral.400" mt={0.5}>{sub}</Typography>}
  </div>
);

// ── Grade distribution mini-bar ───────────────────────────────────────────────
const GradeBar = ({ grades, total }: { grades: Record<string, number>; total: number }) => (
  <div className="flex gap-1 mt-1 h-2 rounded-full overflow-hidden">
    {Object.entries(grades).sort().map(([g, cnt]) => (
      <div
        key={g}
        title={`${g}: ${cnt}`}
        style={{ width: `${(cnt / total) * 100}%`, background: gradeColor(g) }}
      />
    ))}
  </div>
);

// ── Analytics page ─────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");

  const { data: sessionsRes } = useGetSessionsQuery();
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];

  const { data: termsRes } = useGetTermsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId }
  );
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

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

  const { data: subjectRes, isLoading: subLoading } = useGetSubjectAnalyticsQuery(
    { ...(sessionId ? { sessionId } : {}), ...(termId ? { termId } : {}) },
    { skip: !sessionId || !termId }
  );
  const subjectData = (subjectRes?.data as unknown as any[]) ?? [];

  const { data: systemRes, isLoading: sysLoading } = useGetSystemAnalyticsQuery(
    { ...(sessionId ? { sessionId } : {}), ...(termId ? { termId } : {}) },
    { skip: !isAdmin || !sessionId || !termId }
  );
  const centerData = (systemRes?.data as unknown as any[]) ?? [];

  // Overall aggregates from subject data
  const avgScore = subjectData.length
    ? subjectData.reduce((s, d) => s + d.averageScore, 0) / subjectData.length
    : 0;
  const totalStudents = subjectData.length > 0 ? Math.max(...subjectData.map((d) => d.totalStudents)) : 0;

  return (
    <Frame text="Academic Analytics">
      {/* Filters */}
      <Stack direction="row" gap={3} mt={4} flexWrap="wrap" alignItems="flex-end">
        <FormControl size="sm" sx={{ minWidth: 200 }}>
          <FormLabel>Session</FormLabel>
          <Select placeholder="Select session" value={sessionId} onChange={(_, v) => { setSessionId(v as string); setTermId(""); }}>
            {sessions.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
          </Select>
        </FormControl>
        <FormControl size="sm" sx={{ minWidth: 180 }}>
          <FormLabel>Term</FormLabel>
          <Select placeholder="Select term" value={termId} onChange={(_, v) => setTermId(v as string)}>
            {terms.map((t) => <Option key={t._id} value={t._id}>{t.name}</Option>)}
          </Select>
        </FormControl>
      </Stack>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <MetricCard label="Total Students" value={totalStudents} />
        <MetricCard label="Subjects Tracked" value={subjectData.length} />
        <MetricCard
          label="Overall Average"
          value={`${avgScore.toFixed(1)}%`}
          sub={avgScore >= 50 ? "Above pass mark" : "Below pass mark"}
        />
        {isAdmin && (
          <MetricCard label="Centres" value={centerData.length} />
        )}
      </div>

      {/* Subject performance table */}
      <div className="bg-white rounded-2xl border border-[#E6ECFF] shadow-sm mt-6 overflow-x-auto">
        <div className="px-6 py-4 border-b border-[#E6ECFF]">
          <Typography level="title-md">Subject Performance</Typography>
        </div>
        {subLoading ? (
          <div className="flex justify-center py-12"><CircularProgress /></div>
        ) : subjectData.length === 0 ? (
          <div className="text-center py-12 text-[#94a3b8] text-sm">No data for selection</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F5FAFF] text-xs text-[#475569] uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Subject</th>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-center">Students</th>
                <th className="px-5 py-3 text-center">Avg Score</th>
                <th className="px-5 py-3 text-center">Highest</th>
                <th className="px-5 py-3 text-center">Lowest</th>
                <th className="px-5 py-3">Grade Distribution</th>
              </tr>
            </thead>
            <tbody>
              {subjectData
                .sort((a, b) => b.averageScore - a.averageScore)
                .map((s) => (
                  <tr key={s.subjectId} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-medium text-[#001F54]">{s.subjectName}</td>
                    <td className="px-5 py-3 text-[#94a3b8]">{s.subjectCode}</td>
                    <td className="px-5 py-3 text-center">{s.totalStudents}</td>
                    <td className="px-5 py-3 text-center font-bold" style={{ color: s.averageScore >= 50 ? "#16a34a" : "#dc2626" }}>
                      {s.averageScore.toFixed(1)}%
                    </td>
                    <td className="px-5 py-3 text-center text-green-600 font-semibold">{s.highestScore}</td>
                    <td className="px-5 py-3 text-center text-red-500 font-semibold">{s.lowestScore}</td>
                    <td className="px-5 py-3 w-40">
                      <GradeBar grades={s.gradeDistribution} total={s.totalStudents} />
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {Object.entries(s.gradeDistribution).sort().map(([g, c]) => (
                          <span key={g} className="text-xs" style={{ color: gradeColor(g) }}>
                            {g}:{c as number}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Centre comparison (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-[#E6ECFF] shadow-sm mt-6 overflow-x-auto">
          <div className="px-6 py-4 border-b border-[#E6ECFF]">
            <Typography level="title-md">Centre Performance Comparison</Typography>
          </div>
          {sysLoading ? (
            <div className="flex justify-center py-12"><CircularProgress /></div>
          ) : centerData.length === 0 ? (
            <div className="text-center py-12 text-[#94a3b8] text-sm">No centre data available</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#F5FAFF] text-xs text-[#475569] uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Centre</th>
                  <th className="px-5 py-3 text-center">Students</th>
                  <th className="px-5 py-3 text-center">Avg Score</th>
                  <th className="px-5 py-3 text-center">Pass Rate</th>
                  <th className="px-5 py-3">Pass Rate Bar</th>
                </tr>
              </thead>
              <tbody>
                {centerData
                  .sort((a, b) => b.averageScore - a.averageScore)
                  .map((c, idx) => (
                    <tr key={c.centerId} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3 font-medium text-[#001F54]">
                        <span className="text-[#94a3b8] mr-2">#{idx + 1}</span>
                        {c.centerName}
                      </td>
                      <td className="px-5 py-3 text-center">{c.totalStudents}</td>
                      <td className="px-5 py-3 text-center font-bold" style={{ color: c.averageScore >= 50 ? "#16a34a" : "#dc2626" }}>
                        {c.averageScore.toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-[#001EC5]">
                        {c.passRate.toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 w-40">
                        <div className="bg-[#E6ECFF] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-[#001EC5] transition-all"
                            style={{ width: `${c.passRate}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Frame>
  );
};

export default AnalyticsPage;
