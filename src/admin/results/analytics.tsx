import {
  Select,
  Option,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  CircularProgress,
} from "@mui/joy";
import { useEffect, useState } from "react";
import Frame from "../../components/frame/Frame";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetSessionsQuery,
  useGetTermsQuery,
  useGetSubjectAnalyticsQuery,
  useGetSystemAnalyticsQuery,
} from "../../data/rtk/academic";
import { gradeColor } from "../../utils/academic";
import PageCard from "../../components/feedback/PageCard";
import {
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/feedback/TableShell";

const MetricCard = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) => (
  <div className="bg-white border border-[#E6ECFF] rounded-2xl p-5">
    <Typography level="body-xs" textColor="#6B7280">
      {label}
    </Typography>
    <Typography level="h3" sx={{ fontWeight: 800, color: "#001F54", mt: 0.5 }}>
      {value}
    </Typography>
    {sub && (
      <Typography level="body-xs" textColor="#94A3B8" sx={{ mt: 0.5 }}>
        {sub}
      </Typography>
    )}
  </div>
);

const GradeBar = ({
  grades,
  total,
}: {
  grades: Record<string, number>;
  total: number;
}) => (
  <div className="flex gap-1 mt-1 h-2 rounded-full overflow-hidden">
    {Object.entries(grades)
      .sort()
      .map(([g, cnt]) => (
        <div
          key={g}
          title={`${g}: ${cnt}`}
          style={{ width: `${(cnt / total) * 100}%`, background: gradeColor(g) }}
        />
      ))}
  </div>
);

const AnalyticsPage = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");

  const { data: sessionsRes } = useGetSessionsQuery();
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];

  const { data: termsRes } = useGetTermsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId },
  );
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

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

  const { data: subjectRes, isLoading: subLoading } =
    useGetSubjectAnalyticsQuery(
      { ...(sessionId ? { sessionId } : {}), ...(termId ? { termId } : {}) },
      { skip: !sessionId || !termId },
    );
  const subjectData = (subjectRes?.data as unknown as any[]) ?? [];

  const { data: systemRes, isLoading: sysLoading } = useGetSystemAnalyticsQuery(
    { ...(sessionId ? { sessionId } : {}), ...(termId ? { termId } : {}) },
    { skip: !isAdmin || !sessionId || !termId },
  );
  const centerData = (systemRes?.data as unknown as any[]) ?? [];

  const avgScore = subjectData.length
    ? subjectData.reduce((s, d) => s + d.averageScore, 0) / subjectData.length
    : 0;
  const totalStudents =
    subjectData.length > 0
      ? Math.max(...subjectData.map((d) => d.totalStudents))
      : 0;

  return (
    <Frame text="Academic Analytics">
      <div className="space-y-6 mt-6 pb-16">
        <PageCard>
          <Stack direction="row" gap={3} flexWrap="wrap" alignItems="flex-end">
            <FormControl size="sm" sx={{ minWidth: 200 }}>
              <FormLabel>Session</FormLabel>
              <Select
                placeholder="Select session"
                value={sessionId}
                onChange={(_, v) => {
                  setSessionId(v as string);
                  setTermId("");
                }}
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
          </Stack>
        </PageCard>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        <PageCard padded={false} title="Subject Performance">
            <div className="overflow-x-auto min-h-[400px]">
            {subLoading ? (
              <div className="flex justify-center py-12">
                <CircularProgress />
              </div>
            ) : subjectData.length === 0 ? (
              <div className="text-center py-12 text-[#94A3B8] text-sm">
                No data for selection
              </div>
            ) : (
              <table className="w-full text-sm">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Subject</TableHeaderCell>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Students
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Avg Score
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Highest
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Lowest
                    </TableHeaderCell>
                    <TableHeaderCell>Grade Distribution</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {subjectData
                    .slice()
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .map((s) => (
                      <TableRow key={s.subjectId}>
                        <TableCell>{s.subjectName}</TableCell>
                        <TableCell>
                          <span className="text-[#94A3B8]">
                            {s.subjectCode}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {s.totalStudents}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          <span
                            style={{
                              color: s.averageScore >= 50 ? "#16a34a" : "#dc2626",
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
                          <div className="w-40">
                            <GradeBar
                              grades={s.gradeDistribution}
                              total={s.totalStudents}
                            />
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {Object.entries(s.gradeDistribution)
                                .sort()
                                .map(([g, c]) => (
                                  <span
                                    key={g}
                                    className="text-xs"
                                    style={{ color: gradeColor(g) }}
                                  >
                                    {g}:{c as number}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </table>
            )}
          </div>
        </PageCard>

        {isAdmin && (
          <PageCard padded={false} title="Centre Performance Comparison">
          <div className="overflow-x-auto min-h-[400px]">
              {sysLoading ? (
                <div className="flex justify-center py-12">
                  <CircularProgress />
                </div>
              ) : centerData.length === 0 ? (
                <div className="text-center py-12 text-[#94A3B8] text-sm">
                  No centre data available
                </div>
              ) : (
                <table className="w-full text-sm">
                  <TableHeader>
                    <tr>
                      <TableHeaderCell>Centre</TableHeaderCell>
                      <TableHeaderCell className="text-center">
                        Students
                      </TableHeaderCell>
                      <TableHeaderCell className="text-center">
                        Avg Score
                      </TableHeaderCell>
                      <TableHeaderCell className="text-center">
                        Pass Rate
                      </TableHeaderCell>
                      <TableHeaderCell>Pass Rate Bar</TableHeaderCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {centerData
                      .slice()
                      .sort((a, b) => b.averageScore - a.averageScore)
                      .map((c, idx) => (
                        <TableRow key={c.centerId}>
                          <TableCell>
                            <span className="text-[#94A3B8] mr-2">
                              #{idx + 1}
                            </span>
                            {c.centerName}
                          </TableCell>
                          <TableCell className="text-center">
                            {c.totalStudents}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            <span
                              style={{
                                color:
                                  c.averageScore >= 50 ? "#16a34a" : "#dc2626",
                              }}
                            >
                              {c.averageScore.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-[#001EC5]">
                            {c.passRate.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <div className="w-40">
                              <div className="bg-[#E6ECFF] rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-2 rounded-full bg-[#001EC5] transition-all"
                                  style={{ width: `${c.passRate}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </table>
              )}
            </div>
          </PageCard>
        )}
      </div>
    </Frame>
  );
};

export default AnalyticsPage;
