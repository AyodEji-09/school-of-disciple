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
  useGetYearAnalyticsQuery,
  useGetSystemAnalyticsQuery,
} from "../../data/rtk/academic";
import { useGetCentersQuery } from "../../data/rtk/center";
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

const AnalyticsPage = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";

  const [sessionId, setSessionId] = useState("");
  const [centerId, setCenterId] = useState("");

  const { data: sessionsData = [] } = useGetSessionsQuery();
  const sessions = sessionsData as unknown as AcademicSession[];

  const { data: centersRes } = useGetCentersQuery(
    { page: 1, limit: 100 },
    { skip: !isAdmin },
  );
  const centers = centersRes?.data?.docs ?? [];

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const current = sessions.find((s) => s.isCurrent) || sessions[0];
      if (current) setSessionId(current._id);
    }
  }, [sessions, sessionId]);

  const { data: yearRes, isLoading: yearLoading } = useGetYearAnalyticsQuery(
    {
      sessionId,
      ...(isAdmin && centerId ? { centerId } : {}),
    },
    { skip: !sessionId },
  );
  const yearData = (yearRes?.data as unknown as YearPerformanceSummary[]) ?? [];

  const { data: systemRes, isLoading: sysLoading } = useGetSystemAnalyticsQuery(
    {
      sessionId,
      ...(isAdmin && centerId ? { centerId } : {}),
    },
    { skip: !isAdmin || !sessionId },
  );
  const centerData = (systemRes?.data as unknown as CenterPerformanceSummary[]) ?? [];

  const avgScore = yearData.length
    ? yearData.reduce((s, d) => s + d.averageScore, 0) / yearData.length
    : 0;
  const totalStudents =
    yearData.length > 0
      ? Math.max(...yearData.map((d) => d.totalStudents))
      : 0;

  return (
    <Frame text="Academic Analytics">
      <div className="space-y-6 mt-6 pb-16">
        <PageCard>
          <Stack direction="row" gap={3} flexWrap="wrap" alignItems="flex-end">
            <FormControl size="sm" sx={{ minWidth: 220 }}>
              <FormLabel>Session</FormLabel>
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
            {isAdmin && (
              <FormControl size="sm" sx={{ minWidth: 220 }}>
                <FormLabel>Centre</FormLabel>
                <Select
                  placeholder="All centres"
                  value={centerId}
                  onChange={(_, v) => setCenterId(v as string)}
                >
                  <Option value="">All centres</Option>
                  {centers.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </PageCard>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Students" value={totalStudents} />
          <MetricCard label="Years Tracked" value={yearData.length} />
          <MetricCard
            label="Overall Average"
            value={`${avgScore.toFixed(1)}%`}
          />
          {isAdmin && (
            <MetricCard label="Centres" value={centerData.length} />
          )}
        </div>

        <PageCard padded={false} title="Year Performance">
          <div className="overflow-x-auto min-h-[400px]">
            {yearLoading ? (
              <div className="flex justify-center py-12">
                <CircularProgress />
              </div>
            ) : yearData.length === 0 ? (
              <div className="text-center py-12 text-[#94A3B8] text-sm">
                No data for selection
              </div>
            ) : (
              <table className="w-full text-sm">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Year</TableHeaderCell>
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
                  </tr>
                </TableHeader>
                <TableBody>
                  {yearData
                    .slice()
                    .sort((a, b) => a.yearNumber - b.yearNumber)
                    .map((s) => (
                      <TableRow key={s.yearId}>
                        <TableCell>
                          <span className="font-semibold text-[#001F54]">
                            {s.yearName}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {s.totalStudents}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {s.averageScore.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center text-green-600 font-semibold">
                          {s.highestScore}
                        </TableCell>
                        <TableCell className="text-center text-red-500 font-semibold">
                          {s.lowestScore}
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
                            {c.averageScore.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-center font-semibold text-[#16a34a]">
                            {c.passRate.toFixed(1)}%
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
