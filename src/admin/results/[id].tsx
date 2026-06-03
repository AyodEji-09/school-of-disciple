import { Chip, Typography, Stack, CircularProgress, Divider } from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useGetResultByIdQuery } from "../../data/rtk/academic";
import { STATUS_COLOR, gradeColor, resolveName } from "../../utils/academic";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import moment from "moment";
import { Print } from "@mui/icons-material";

const ResultDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isCoordinator = user?.type === "coordinator";
  const { data: res, isLoading } = useGetResultByIdQuery(id!);
  const result = res?.data as unknown as StudentResult | undefined;

  const handlePrintOrDownload = () => {
    const token = localStorage.getItem("token");
    window.open(
      `${import.meta.env.VITE_API_URL ?? ""}/academic/results/${id}/pdf`,
      "_blank"
    );
  };

  if (isLoading) {
    return (
      <Frame text="Result Detail">
        <div className="flex justify-center py-24"><CircularProgress /></div>
      </Frame>
    );
  }

  if (!result) {
    return (
      <Frame text="Result Detail">
        <div className="text-center py-24 text-[#475569]">Result not found.</div>
      </Frame>
    );
  }

  const student = result.studentId as any;
  const center = result.centerId as any;
  const session = result.sessionId as any;
  const term = result.termId as any;

  return (
    <Frame text="Result Detail">
      <div className="max-w-3xl mx-auto mt-6 grid gap-5">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-[#001F54] to-[#001EC5] rounded-2xl p-8 text-white">
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={3}>
            <div>
              <Typography level="h3" sx={{ color: "white", fontWeight: 800 }}>
                {student?.firstName} {student?.lastName}
              </Typography>
              <Typography level="body-sm" sx={{ color: "#93c5fd", mt: 0.5 }}>
                Matric No: {student?.matricNumber ?? "N/A"}
              </Typography>
              <Typography level="body-sm" sx={{ color: "#93c5fd" }}>
                Centre: {resolveName(center)}
              </Typography>
            </div>
            <div className="text-right">
              <Chip color={STATUS_COLOR[result.status]} variant="soft" size="lg">
                {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
              </Chip>
              <Typography level="body-sm" sx={{ color: "#bfdbfe", mt: 1 }}>
                {session?.name} · {term?.name}
              </Typography>
              <Typography level="body-xs" sx={{ color: "#93c5fd" }}>
                {moment(result.createdAt).format("DD MMMM YYYY")}
              </Typography>
            </div>
          </Stack>

          {/* Score strip */}
          <div className="grid grid-cols-3 gap-4 mt-6 bg-white/10 rounded-xl p-4">
            <div className="text-center">
              <Typography level="h2" sx={{ color: "white", fontWeight: 900 }}>
                {result.totalScore}
              </Typography>
              <Typography level="body-xs" sx={{ color: "#bfdbfe" }}>Total Score</Typography>
            </div>
            <div className="text-center border-x border-white/20">
              <Typography
                level="h2"
                sx={{ color: result.average >= 50 ? "#86efac" : "#fca5a5", fontWeight: 900 }}
              >
                {result.average.toFixed(1)}%
              </Typography>
              <Typography level="body-xs" sx={{ color: "#bfdbfe" }}>Average</Typography>
            </div>
            <div className="text-center">
              <Typography level="h2" sx={{ color: result.average >= 50 ? "#86efac" : "#fca5a5", fontWeight: 900 }}>
                {result.average >= 50 ? "PASS" : "FAIL"}
              </Typography>
              <Typography level="body-xs" sx={{ color: "#bfdbfe" }}>Overall</Typography>
            </div>
          </div>
        </div>

        {/* Subjects table */}
        <div className="bg-white rounded-2xl border border-[#E6ECFF] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E6ECFF]">
            <Typography level="title-md">Subject Breakdown</Typography>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#F5FAFF] text-xs text-[#475569] uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Subject</th>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-center">Score</th>
                <th className="px-6 py-3 text-center">Grade</th>
                <th className="px-6 py-3 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((sub, i) => {
                const subj = sub.subjectId as any;
                return (
                  <tr key={i} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-6 py-3.5 font-medium text-[#001F54]">{subj?.name ?? "—"}</td>
                    <td className="px-6 py-3.5 text-[#475569]">{subj?.code ?? "—"}</td>
                    <td className="px-6 py-3.5 text-center font-bold">
                      <span style={{ color: sub.score >= 50 ? "#16a34a" : "#dc2626" }}>
                        {sub.score}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-full"
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

        {/* Actions */}
        <Stack direction="row" gap={2} justifyContent="flex-end">
          <AppButton variant="outlined" onClick={() => navigate(-1)}>← Back</AppButton>
          {isCoordinator && result.status === "draft" && (
            <AppButton variant="outlined" onClick={() => navigate(`/dashboard/results/${id}/edit`)}>
              Edit
            </AppButton>
          )}
          {(result.status === "published" || result.status === "locked") && (
            <AppButton onClick={handlePrintOrDownload}>
              <Print sx={{ fontSize: 16, mr: 0.5 }} /> Download PDF
            </AppButton>
          )}
        </Stack>
      </div>
    </Frame>
  );
};

export default ResultDetailPage;
