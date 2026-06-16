import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option,
  Box,
} from "@mui/joy";
import { RocketLaunch } from "@mui/icons-material";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetResultsQuery,
  useGetSessionsQuery,
  usePublishSessionResultsMutation,
} from "../../data/rtk/academic";
import { useGetCentersQuery } from "../../data/rtk/center";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import { resolveId, resolveName } from "../../utils/academic";
import moment from "moment";
import { toast } from "react-toastify";
import { handleError } from "../../utils";
import PageCard from "../../components/feedback/PageCard";
import StatusBadge from "../../components/feedback/StatusBadge";
import {
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyValue,
} from "../../components/feedback/TableShell";
import ActionLink from "../../components/feedback/ActionLink";
import { RESULT_STATUS, CENTER_RESULT_STATUS } from "../../utils/status";

const ResultsPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isCoordinator = user?.type === "coordinator";
  const isAdmin = user?.type === "admin" || user?.type === "super";

  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState<ResultStatus | "">("");
  const [viewCenterId, setViewCenterId] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const { data: sessionsData = [] } = useGetSessionsQuery();
  const sessions = sessionsData as unknown as AcademicSession[];

  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const { data: centersRes } = useGetCentersQuery(
    { page: 1, limit: 100 },
    { skip: !isAdmin },
  );
  const centers = centersRes?.data?.docs ?? [];

  const { data, isLoading } = useGetResultsQuery({
    ...(sessionId ? { sessionId } : {}),
    ...(status ? { status } : {}),
    ...(isCoordinator && coordinatorCenterId
      ? { centerId: coordinatorCenterId }
      : {}),
  });

  const [publishSession, { isLoading: publishing }] =
    usePublishSessionResultsMutation();
  const results = (data ?? []) as unknown as StudentResult[];

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const current = sessions.find((s) => s.isCurrent) || sessions[0];
      if (current) setSessionId(current._id);
    }
  }, [sessions, sessionId]);

  const draftCount = useMemo(
    () => results.filter((r) => r.status === "draft").length,
    [results],
  );
  const pendingCount = useMemo(
    () =>
      results.filter(
        (r) =>
          r.status === "draft" ||
          ((r as any).draftYearScores?.length ?? 0) > 0,
      ).length,
    [results],
  );
  const selectedSession = sessions.find((s) => s._id === sessionId);

  const handlePublishAll = async () => {
    if (!sessionId) return;
    try {
      const res = await publishSession({ sessionId }).unwrap();
      // Backend returns `{ message: "Published N results" }`. Parse the count
      // out of the message so we can show a useful toast.
      const match = res?.message?.match(/Published\s+(\d+)/i);
      const n = match ? Number(match[1]) : 0;
      toast.success(
        n > 0
          ? `Published ${n} draft result${n === 1 ? "" : "s"} for ${selectedSession?.name ?? "this session"}`
          : res?.message ?? "No draft results to publish for this session",
      );
      setConfirmPublish(false);
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const displayedResults = viewCenterId
    ? results.filter((r) => resolveId(r.centerId) === viewCenterId)
    : results;

  return (
    <Frame text="Academic Results">
      <div className="space-y-6 mt-6 pb-16">
        {!isLoading && results.length > 0 && isCoordinator && (
          <Stack direction="row" gap={3} flexWrap="wrap">
            {(["draft", "published"] as ResultStatus[]).map((s) => {
              const count = results.filter((r) => r.status === s).length;
              return (
                <div
                  key={s}
                  className="bg-white border border-[#E6ECFF] rounded-2xl px-5 py-4 flex items-center gap-3 min-w-[180px]"
                >
                  <StatusBadge status={s} map={RESULT_STATUS} />
                  <Typography
                    level="title-lg"
                    sx={{ color: "#001F54", fontWeight: 700 }}
                  >
                    {count}
                  </Typography>
                </div>
              );
            })}
            {(() => {
              const n = results.filter(
                (r) =>
                  r.status === "published" &&
                  ((r as any).draftYearScores?.length ?? 0) > 0,
              ).length;
              if (n === 0) return null;
              return (
                <div className="bg-white border border-[#E6ECFF] rounded-2xl px-5 py-4 flex items-center gap-3 min-w-[180px]">
                  <StatusBadge status="draft_pending" map={RESULT_STATUS} />
                  <Typography
                    level="title-lg"
                    sx={{ color: "#001F54", fontWeight: 700 }}
                  >
                    {n}
                  </Typography>
                </div>
              );
            })()}
          </Stack>
        )}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography level="body-sm" textColor="neutral.500">
            {isCoordinator
              ? "Manage and upload student results for your centre."
              : "View results across all centres."}
          </Typography>

          {isCoordinator && (
            <Stack direction="row" gap={2} flexWrap="wrap">
              <AppButton onClick={() => navigate("/dashboard/results/upload")}>
                + Upload Result
              </AppButton>
              <AppButton
                variant="outlined"
                onClick={() => navigate("/dashboard/results/bulk-upload")}
              >
                Bulk Upload (Excel)
              </AppButton>
              {pendingCount > 0 && (
                <AppButton onClick={() => setConfirmPublish(true)}>
                  <RocketLaunch sx={{ fontSize: 16, mr: 0.5 }} />
                  Publish {pendingCount} Item{pendingCount === 1 ? "" : "s"}
                </AppButton>
              )}
            </Stack>
          )}
          {isAdmin && (
            <Stack direction="row" gap={2} flexWrap="wrap">
              <AppButton
                variant="outlined"
                onClick={() => navigate("/dashboard/results/analytics")}
              >
                Analytics
              </AppButton>
              <AppButton
                variant="outlined"
                onClick={() => navigate("/dashboard/results/reports")}
              >
                Reports
              </AppButton>
            </Stack>
          )}
        </Stack>

        <PageCard>
          <Stack direction="row" gap={2} flexWrap="wrap" alignItems="flex-end">
            <FormControl size="sm" sx={{ minWidth: 220 }}>
              <FormLabel>Session</FormLabel>
              <Select
                size="sm"
                value={sessionId}
                onChange={(_, v) => {
                  setSessionId((v as string) ?? "");
                  setViewCenterId(null);
                }}
                placeholder="Select session"
              >
                {sessions.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl size="sm" sx={{ minWidth: 160 }}>
              <FormLabel>Status</FormLabel>
              <Select
                size="sm"
                value={status}
                onChange={(_, v) => setStatus((v as ResultStatus | "") ?? "")}
                placeholder="All statuses"
              >
                <Option value="">All statuses</Option>
                <Option value="draft">Draft</Option>
                <Option value="published">Published</Option>
              </Select>
            </FormControl>
          </Stack>
        </PageCard>

        {isAdmin && viewCenterId && (
          <Stack direction="row" alignItems="center" gap={2}>
            <AppButton
              size="sm"
              variant="outlined"
              onClick={() => setViewCenterId(null)}
            >
              ← Back to Centres
            </AppButton>
            <Typography level="title-md" sx={{ color: "#001F54" }}>
              Results for:{" "}
              {centers.find((c) => c._id === viewCenterId)?.name ??
                "Selected Centre"}
            </Typography>
          </Stack>
        )}

        <PageCard padded={false}>
          <div className="overflow-x-auto min-h-[400px]">
            {isAdmin && !viewCenterId ? (
              <table className="w-full text-sm text-left">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Centre</TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Students Uploaded
                    </TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Action
                    </TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4}>
                        <TableSkeleton columns={4} rows={6} />
                      </td>
                    </tr>
                  ) : centers.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <CenteredEmptyState description="No centres configured." />
                      </td>
                    </tr>
                  ) : (
                    centers.map((center) => {
                      const centerResults = results.filter(
                        (r) => resolveId(r.centerId) === center._id,
                      );
                      const totalUploaded = centerResults.length;

                      const centerStatus: keyof typeof CENTER_RESULT_STATUS =
                        totalUploaded === 0
                          ? "not_uploaded"
                          : centerResults.some((r) => r.status === "draft")
                            ? "draft"
                            : centerResults.some(
                                  (r) =>
                                    r.status === "published" &&
                                    ((r as any).draftYearScores?.length ?? 0) >
                                      0,
                                )
                              ? "draft_pending"
                              : "published";

                      return (
                        <TableRow key={center._id}>
                          <TableCell>{center.name}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {totalUploaded}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={centerStatus}
                              map={CENTER_RESULT_STATUS}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {totalUploaded > 0 ? (
                              <ActionLink
                                onClick={() => setViewCenterId(center._id)}
                              >
                                View Results
                              </ActionLink>
                            ) : (
                              <EmptyValue />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </table>
            ) : (
              <table className="w-full text-sm text-left">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Matric No.</TableHeaderCell>
                    <TableHeaderCell>Centre</TableHeaderCell>
                    <TableHeaderCell>Session</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Action
                    </TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7}>
                        <TableSkeleton columns={7} rows={6} />
                      </td>
                    </tr>
                  ) : displayedResults.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <CenteredEmptyState description="No results found." />
                      </td>
                    </tr>
                  ) : (
                    displayedResults.map((r) => {
                      const student = r.studentId as any;
                      return (
                        <TableRow key={r._id}>
                          <TableCell>
                            {student?.firstName} {student?.lastName}
                          </TableCell>
                          <TableCell>
                            {student?.matricNumber ?? <EmptyValue />}
                          </TableCell>
                          <TableCell>
                            {resolveName(r.centerId as any)}
                          </TableCell>
                          <TableCell>
                            {resolveName(r.sessionId as any)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={
                                r.status === "published" &&
                                ((r as any).draftYearScores?.length ?? 0) > 0
                                  ? "draft_pending"
                                  : r.status
                              }
                              map={RESULT_STATUS}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="text-[#475569] text-xs">
                              {moment(r.createdAt).format("DD MMM YYYY")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Stack
                              direction="row"
                              gap={2}
                              justifyContent="flex-end"
                            >
                              <ActionLink
                                onClick={() =>
                                  navigate(`/dashboard/results/${r._id}`)
                                }
                              >
                                View
                              </ActionLink>
                              {isCoordinator && (
                                <ActionLink
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/results/${r._id}/edit`,
                                    )
                                  }
                                  variant="muted"
                                >
                                  Edit
                                </ActionLink>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </table>
            )}
          </div>
        </PageCard>
      </div>

      <Modal
        open={confirmPublish}
        onClose={() => (publishing ? null : setConfirmPublish(false))}
      >
        <ModalDialog variant="outlined" role="alertdialog">
          <ModalClose disabled={publishing} />
          <DialogTitle>Publish all draft results?</DialogTitle>
          <DialogContent>
            <Stack gap={2} mt={1}>
              <Box>
                <Typography level="body-md">
                  You are about to publish{" "}
                  <strong>{pendingCount}</strong> item{pendingCount === 1 ? "" : "s"} for{" "}
                  <strong>{selectedSession?.name ?? "this session"}</strong>.
                  Draft changes will be applied and students will see the
                  updated results.
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <Stack direction="row" gap={1.5} justifyContent="flex-end" mt={2}>
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => setConfirmPublish(false)}
              disabled={publishing}
            >
              Cancel
            </AppButton>
            <AppButton
              type="button"
              onClick={handlePublishAll}
              loading={publishing}
            >
              Publish All
            </AppButton>
          </Stack>
        </ModalDialog>
      </Modal>
    </Frame>
  );
};

export default ResultsPage;
