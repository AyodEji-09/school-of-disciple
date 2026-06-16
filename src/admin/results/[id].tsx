import { Typography, Stack, Chip } from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useGetResultByIdQuery, useGetYearsQuery } from "../../data/rtk/academic";
import { resolveName, resolveId } from "../../utils/academic";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import { TOKEN, useURL } from "../../data/config";
import moment from "moment";
import { ArrowBack, Edit, PictureAsPdf } from "@mui/icons-material";
import PageCard from "../../components/feedback/PageCard";
import {
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyValue,
} from "../../components/feedback/TableShell";
import { PageLoader } from "../../components/query-state/QueryStates";

const ResultDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isCoordinator = user?.type === "coordinator";
  const { data: result, isLoading } = useGetResultByIdQuery(id!);
  const sessionId = resolveId((result as any)?.sessionId);
  const { data: allYears = [] } = useGetYearsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId },
  );

  const handlePrintOrDownload = () => {
    const token = localStorage.getItem(TOKEN);
    window.open(
      `${useURL}/academic/results/${id}/pdf?token=${token ?? ""}`,
      "_blank",
    );
  };

  if (isLoading) {
    return (
      <Frame text="Result Detail">
        <PageLoader label="Loading result…" />
      </Frame>
    );
  }

  if (!result) {
    return (
      <Frame text="Result Detail">
        <div className="text-center py-24 text-[#475569]">
          Result not found.
        </div>
      </Frame>
    );
  }

  const student = result.studentId as any;
  const center = result.centerId as any;
  const session = result.sessionId as any;
  const isPublished = result.status === "published";
  const hasDraft = (result as any).draftYearScores?.length > 0;

  const activeScores = (result as any).draftYearScores?.length
    ? (result as any).draftYearScores
    : result.yearScores ?? [];

  const academicYears = (allYears as unknown as AcademicYear[]).slice().sort(
    (a, b) => a.number - b.number,
  );

  const ysMap = new Map(
    activeScores.map((ys: any) => [resolveId(ys.yearId), ys]),
  );

  const publishedScoresMap = new Map(
    ((result as any).yearScores ?? []).map((ys: any) => [
      resolveId(ys.yearId),
      ys,
    ]),
  );

  const getYearStatus = (yearId: string, score: number | null) => {
    if (score === null || score === undefined) return null;
    if (!hasDraft) return "Published";
    const published = publishedScoresMap.get(yearId);
    if (!published) return "Draft";
    return published.score === score ? "Published" : "Modified";
  };

  const mergedYears = academicYears.map((y) => {
    const ys = ysMap.get(y._id);
    return {
      yearId: y,
      score: ys?.score ?? null,
      remark: ys?.remark ?? null,
    };
  });

  const recordedCount = mergedYears.filter(
    (ys) => ys.score !== null && ys.score !== undefined,
  ).length;

  return (
    <Frame text="Result Detail">
      <div className="max-w-3xl mx-auto mt-6 grid gap-5 pb-16">
        <PageCard padded={false}>
          <div className="flex flex-wrap items-start justify-between gap-4 p-6 border-b border-[#E6ECFF]">
            <div className="min-w-0">
              <Typography
                level="h3"
                sx={{ color: "#001F54", fontWeight: 800 }}
              >
                {student?.firstName} {student?.lastName}
              </Typography>
              <Typography
                level="body-sm"
                textColor="neutral.500"
                sx={{ mt: 0.5 }}
              >
                Matric No: {student?.matricNumber ?? "N/A"}
              </Typography>
            </div>
            <div className="text-right">
              <Typography
                level="title-md"
                sx={{ color: "#001F54", fontWeight: 700 }}
              >
                {session?.name}
              </Typography>
              <Typography
                level="body-xs"
                textColor="neutral.500"
                sx={{ mt: 0.5 }}
              >
                {moment(result.publishedAt ?? result.createdAt).format(
                  "DD MMMM YYYY",
                )}
              </Typography>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E6ECFF]">
            <div className="px-6 py-4">
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
            <div className="px-6 py-4">
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
            <div className="px-6 py-4">
              <Typography level="body-xs" textColor="neutral.500">
                Lifecycle
              </Typography>
              <Typography
                level="title-sm"
                sx={{ color: "#001F54", fontWeight: 600, mt: 0.5 }}
              >
                {isPublished ? (hasDraft ? "Published (draft)" : "Published") : "Draft"}
              </Typography>
            </div>
          </div>
        </PageCard>

        <PageCard padded={false} title="Year Scores">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Year</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Score
                  </TableHeaderCell>
                  <TableHeaderCell className="text-left">
                    Remark
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Status
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {mergedYears.map((ys) => {
                  const yr = ys.yearId as any;
                  const status = getYearStatus(yr._id, ys.score);
                  const statusColor =
                    status === "Published"
                      ? "text-green-600"
                      : status === "Draft"
                        ? "text-yellow-600"
                        : status === "Modified"
                          ? "text-orange-600"
                          : "text-[#94A3B8]";
                  return (
                    <TableRow key={yr._id}>
                      <TableCell>
                        <span className="font-semibold text-[#001F54]">
                          {yr?.name ?? <EmptyValue />}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {ys.score !== null ? (
                          <span className="inline-flex items-baseline gap-1 font-bold text-[#001F54]">
                            {ys.score}
                            <span className="text-xs font-medium text-[#94A3B8]">
                              / 100
                            </span>
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ys.remark ? (
                          ys.remark
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {status ? (
                          <span className={`text-xs font-semibold ${statusColor}`}>
                            {status}
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {mergedYears.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center text-[#94A3B8] py-8">
                      No year scores recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
        </PageCard>

        {hasDraft && (
          <Chip
            color="warning"
            variant="soft"
            size="sm"
            sx={{ alignSelf: "center", mr: "auto" }}
          >
            Draft pending publish
          </Chip>
        )}
        <Stack
          direction="row"
          gap={2}
          justifyContent="flex-end"
          flexWrap="wrap"
        >
          <AppButton
            type="button"
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} /> Back
          </AppButton>
          {isCoordinator && (
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => navigate(`/dashboard/results/${id}/edit`)}
            >
              <Edit sx={{ fontSize: 16, mr: 0.5 }} /> Edit Scores
            </AppButton>
          )}
          {isPublished && (
            <AppButton type="button" onClick={handlePrintOrDownload}>
              <PictureAsPdf sx={{ fontSize: 16, mr: 0.5 }} /> Download PDF
            </AppButton>
          )}
        </Stack>
      </div>
    </Frame>
  );
};

export default ResultDetailPage;
