import { Typography, Stack, CircularProgress } from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import { useGetResultByIdQuery } from "../data/rtk/academic";
import { resolveName } from "../utils/academic";
import { ArrowBack, PictureAsPdf } from "@mui/icons-material";
import moment from "moment";
import { TOKEN, useURL } from "../data/config";
import PageCard from "../components/feedback/PageCard";

const MyResultDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading } = useGetResultByIdQuery(id!);
  const result = res as unknown as StudentResult | undefined;

  const handleDownload = () => {
    const token = localStorage.getItem(TOKEN);
    window.open(
      `${useURL}/academic/results/${id}/pdf?token=${token}`,
      "_blank",
    );
  };

  if (isLoading) {
    return (
      <Frame text="My Result">
        <div className="flex justify-center py-24">
          <CircularProgress />
        </div>
      </Frame>
    );
  }

  if (!result || result.status !== "published") {
    return (
      <Frame text="My Result">
        <div className="text-center py-24 max-w-sm mx-auto">
          <Typography level="h4" textColor="#001F54" mb={1}>
            Result Not Yet Available
          </Typography>
          <Typography level="body-sm" textColor="neutral.500">
            Your result for this session has not been published yet. Please
            check back later.
          </Typography>
          <AppButton
            type="button"
            variant="outlined"
            onClick={() => navigate("/my-dashboard/results")}
            sx={{ mt: 3 }}
          >
            <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} /> Back to Results
          </AppButton>
        </div>
      </Frame>
    );
  }

  const session = result.sessionId as any;
  const center = result.centerId as any;
  const sortedYears = [...(result.yearScores ?? [])].sort((a, b) => {
    const aNum =
      typeof a.yearId === "string" ? 0 : (a.yearId as AcademicYear)?.number ?? 0;
    const bNum =
      typeof b.yearId === "string" ? 0 : (b.yearId as AcademicYear)?.number ?? 0;
    return aNum - bNum;
  });
  const recordedCount = sortedYears.filter(
    (ys) => ys.score !== undefined && ys.score !== null,
  ).length;

  return (
    <Frame text="Academic Report Card">
      <div className="max-w-2xl mx-auto mt-4 grid gap-5 pb-16">
        <PageCard padded={false}>
          <div className="p-6 border-b border-[#E6ECFF] text-center">
            <Typography
              level="h3"
              sx={{
                color: "#001F54",
                fontWeight: 900,
                letterSpacing: "-0.5px",
              }}
            >
              School of Disciples
            </Typography>
            <Typography level="body-sm" textColor="neutral.500" sx={{ mt: 0.5 }}>
              Academic Result — {session?.name}
            </Typography>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E6ECFF]">
            <div className="px-6 py-4 text-center sm:text-left">
              <Typography level="body-xs" textColor="neutral.500">
                Centre
              </Typography>
              <Typography
                level="title-sm"
                sx={{ color: "#001F54", fontWeight: 600, mt: 0.5 }}
              >
                {resolveName(center)}
              </Typography>
            </div>
            <div className="px-6 py-4 text-center">
              <Typography level="body-xs" textColor="neutral.500">
                Years Recorded
              </Typography>
              <Typography
                level="title-sm"
                sx={{ color: "#001F54", fontWeight: 600, mt: 0.5 }}
              >
                {recordedCount}
              </Typography>
            </div>
            <div className="px-6 py-4 text-center sm:text-right">
              <Typography level="body-xs" textColor="neutral.500">
                Published
              </Typography>
              <Typography
                level="title-sm"
                sx={{ color: "#001F54", fontWeight: 600, mt: 0.5 }}
              >
                {moment(result.publishedAt ?? result.createdAt).format(
                  "DD MMM YYYY",
                )}
              </Typography>
            </div>
          </div>
        </PageCard>

        <PageCard padded={false} title="Year Scores">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5FAFF] text-xs text-[#475569] uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Year</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3 text-left">Remark</th>
                </tr>
              </thead>
              <tbody>
                {sortedYears.map((ys) => {
                  const yr = ys.yearId as any;
                  const yearId = yr?._id ?? String(ys.yearId);
                  return (
                    <tr
                      key={yearId}
                      className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]"
                    >
                      <td className="px-6 py-3.5 font-medium text-[#001F54]">
                        {yr?.name ?? "—"}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-baseline gap-1 font-bold text-[#001F54]">
                          {ys.score}
                          <span className="text-xs font-medium text-[#94A3B8]">
                            / 100
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[#475569]">
                        {ys.remark ? (
                          ys.remark
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sortedYears.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-[#94A3B8] text-sm"
                    >
                      No year scores recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PageCard>

        <Stack
          direction="row"
          gap={2}
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <AppButton
            type="button"
            variant="outlined"
            onClick={() => navigate("/my-dashboard/results")}
          >
            <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} /> Back to Results
          </AppButton>
          <AppButton type="button" onClick={handleDownload}>
            <PictureAsPdf sx={{ fontSize: 16, mr: 0.5 }} /> Download Report Card
          </AppButton>
        </Stack>
      </div>
    </Frame>
  );
};

export default MyResultDetailPage;
