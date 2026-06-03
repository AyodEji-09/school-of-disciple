import { Chip, Typography, Stack, CircularProgress } from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import { useGetResultByIdQuery } from "../data/rtk/academic";
import { STATUS_COLOR, gradeColor, resolveName } from "../utils/academic";
import { Print } from "@mui/icons-material";
import moment from "moment";
import { TOKEN } from "../data/config";

import { useURL } from "../data/config";

const MyResultDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading } = useGetResultByIdQuery(id!);
  const result = res?.data as unknown as StudentResult | undefined;

  const handleDownload = () => {
    const token = localStorage.getItem(TOKEN);
    window.open(`${useURL}/academic/results/${id}/pdf?token=${token}`, "_blank");
  };

  if (isLoading) {
    return (
      <Frame text="My Result">
        <div className="flex justify-center py-24"><CircularProgress /></div>
      </Frame>
    );
  }

  if (!result || result.status === "draft" || result.status === "submitted") {
    return (
      <Frame text="My Result">
        <div className="text-center py-24 max-w-sm mx-auto">
          <Typography level="h4" textColor="#001F54" mb={1}>Result Not Yet Available</Typography>
          <Typography level="body-sm" textColor="neutral.500">
            Your result for this term has not been published yet. Please check back later.
          </Typography>
          <AppButton variant="outlined" onClick={() => navigate("/my-dashboard/results")} sx={{ mt: 3 }}>
            ← Back to Results
          </AppButton>
        </div>
      </Frame>
    );
  }

  const session = result.sessionId as any;
  const term = result.termId as any;
  const center = result.centerId as any;
  const passed = result.average >= 50;

  return (
    <Frame text="Academic Report Card">
      <div className="max-w-2xl mx-auto mt-4 grid gap-5">
        {/* Report card header */}
        <div className="bg-gradient-to-br from-[#001F54] to-[#001EC5] rounded-2xl overflow-hidden">
          {/* School header */}
          <div className="px-8 pt-8 pb-5 border-b border-white/10 text-center">
            <Typography level="h3" sx={{ color: "white", fontWeight: 900, letterSpacing: "-0.5px" }}>
              School of Disciples
            </Typography>
            <Typography level="body-sm" sx={{ color: "#bfdbfe", mt: 0.5 }}>
              Academic Result — {session?.name} · {term?.name}
            </Typography>
          </div>

          {/* Score strip */}
          <div className="grid grid-cols-3 divide-x divide-white/10 px-4 py-6">
            <div className="text-center">
              <Typography level="h2" sx={{ color: "white", fontWeight: 900 }}>{result.totalScore}</Typography>
              <Typography level="body-xs" sx={{ color: "#93c5fd" }}>Total Score</Typography>
            </div>
            <div className="text-center">
              <Typography
                level="h2"
                sx={{ color: passed ? "#86efac" : "#fca5a5", fontWeight: 900 }}
              >
                {result.average.toFixed(1)}%
              </Typography>
              <Typography level="body-xs" sx={{ color: "#93c5fd" }}>Average</Typography>
            </div>
            <div className="text-center">
              <Typography
                level="h2"
                sx={{ color: passed ? "#86efac" : "#fca5a5", fontWeight: 900 }}
              >
                {passed ? "PASS" : "FAIL"}
              </Typography>
              <Typography level="body-xs" sx={{ color: "#93c5fd" }}>Overall</Typography>
            </div>
          </div>

          {/* Meta row */}
          <div className="px-8 pb-6 flex justify-between items-center">
            <Typography level="body-xs" sx={{ color: "#93c5fd" }}>
              Centre: {resolveName(center)}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <Chip color={STATUS_COLOR[result.status]} variant="solid" size="sm">
                {result.status.toUpperCase()}
              </Chip>
              <Typography level="body-xs" sx={{ color: "#93c5fd" }}>
                {moment(result.publishedAt ?? result.createdAt).format("DD MMM YYYY")}
              </Typography>
            </Stack>
          </div>
        </div>

        {/* Subject table */}
        <div className="bg-white rounded-2xl border border-[#E6ECFF] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E6ECFF] flex items-center justify-between">
            <Typography level="title-md">Subject Results</Typography>
            <Typography level="body-sm" textColor="neutral.500">{result.subjects.length} subjects</Typography>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#F5FAFF] text-xs text-[#475569] uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Subject</th>
                <th className="px-6 py-3 text-center">Score</th>
                <th className="px-6 py-3 text-center">Grade</th>
                <th className="px-6 py-3 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((sub, i) => {
                const subj = sub.subjectId as any;
                const scorePassed = sub.score >= 50;
                return (
                  <tr key={i} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-[#001F54]">{subj?.name ?? "—"}</div>
                      <div className="text-xs text-[#94a3b8]">{subj?.code}</div>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold"
                        style={{
                          background: scorePassed ? "#dcfce7" : "#fee2e2",
                          color: scorePassed ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {sub.score}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className="inline-block font-bold text-sm px-3 py-0.5 rounded-full"
                        style={{
                          color: gradeColor(sub.grade),
                          background: gradeColor(sub.grade) + "20",
                        }}
                      >
                        {sub.grade}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#475569]">{sub.remark}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Passed/failed statement */}
        <div
          className={`rounded-2xl px-6 py-4 text-center ${
            passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}
        >
          <Typography level="title-md" sx={{ color: passed ? "#16a34a" : "#dc2626" }}>
            {passed
              ? "🎉 Congratulations! You passed this term."
              : "You did not pass this term. Keep working hard!"}
          </Typography>
        </div>

        {/* Actions */}
        <Stack direction="row" gap={2} justifyContent="space-between" flexWrap="wrap">
          <AppButton variant="outlined" onClick={() => navigate("/my-dashboard/results")}>
            ← Back to Results
          </AppButton>
          <AppButton onClick={handleDownload}>
            <Print sx={{ fontSize: 16, mr: 0.5 }} /> Download Report Card
          </AppButton>
        </Stack>
      </div>
    </Frame>
  );
};

export default MyResultDetailPage;
