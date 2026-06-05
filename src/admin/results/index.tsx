import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  Option,
  Typography,
  Stack,
  FormControl,
  FormLabel,
} from "@mui/joy";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetResultsQuery,
  useGetSessionsQuery,
  useGetTermsQuery,
  useGetPublicationsQuery,
  useApprovePublicationMutation,
  useRejectPublicationMutation,
  useLockResultsMutation,
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
import { RESULT_STATUS } from "../../utils/status";

const ResultsPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isCoordinator = user?.type === "coordinator";
  const isAdmin = user?.type === "admin" || user?.type === "super";

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");
  const [status, setStatus] = useState<ResultStatus | "">("");
  const [viewCenterId, setViewCenterId] = useState<string | null>(null);

  const { data: sessionsRes } = useGetSessionsQuery();
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];

  const { data: termsRes } = useGetTermsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId },
  );
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const { data: centersRes } = useGetCentersQuery(
    { page: 1, limit: 100 },
    { skip: !isAdmin },
  );
  const centers = centersRes?.data?.docs ?? [];

  const { data: publicationsRes } = useGetPublicationsQuery(
    sessionId && termId ? { sessionId, termId } : undefined,
    { skip: !sessionId || !termId },
  );
  const publications =
    (publicationsRes?.data as unknown as ResultPublication[]) ?? [];

  const { data, isLoading } = useGetResultsQuery({
    ...(sessionId ? { sessionId } : {}),
    ...(termId ? { termId } : {}),
    ...(status ? { status } : {}),
    ...(isCoordinator && coordinatorCenterId
      ? { centerId: coordinatorCenterId }
      : {}),
  });

  const [approvePublication] = useApprovePublicationMutation();
  const [rejectPublication] = useRejectPublicationMutation();
  const [lockResults] = useLockResultsMutation();

  const results = (data?.data as unknown as StudentResult[]) ?? [];

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

  const handleApprove = async (pubId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to approve this centre's results? This will publish the results to students.",
      )
    )
      return;
    try {
      await approvePublication(pubId).unwrap();
      toast.success("Publication approved successfully");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleReject = async (pubId: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason === null) return;
    try {
      await rejectPublication({ id: pubId, rejectionReason: reason }).unwrap();
      toast.success("Publication rejected successfully");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleLock = async (centerId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to lock this centre's results? This will prevent any further edits by coordinators.",
      )
    )
      return;
    try {
      await lockResults({ sessionId, termId, centerId }).unwrap();
      toast.success("Results locked successfully");
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
            {(
              ["draft", "submitted", "published", "locked"] as ResultStatus[]
            ).map((s) => {
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
              : "View and manage results across all centres."}
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
              <AppButton
                variant="outlined"
                onClick={() => navigate("/dashboard/results/submit")}
              >
                Submit for Publication
              </AppButton>
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
            <FormControl size="sm" sx={{ minWidth: 200 }}>
              <FormLabel>Session</FormLabel>
              <Select
                size="sm"
                value={sessionId}
                onChange={(_, v) => {
                  setSessionId((v as string) ?? "");
                  setTermId("");
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

            <FormControl size="sm" sx={{ minWidth: 180 }}>
              <FormLabel>Term</FormLabel>
              <Select
                size="sm"
                value={termId}
                onChange={(_, v) => {
                  setTermId((v as string) ?? "");
                  setViewCenterId(null);
                }}
                placeholder={sessionId ? "Select term" : "Select session first"}
                disabled={!sessionId}
              >
                {terms.map((t) => (
                  <Option key={t._id} value={t._id}>
                    {t.name}
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
                <Option value="submitted">Submitted</Option>
                <Option value="published">Published</Option>
                <Option value="locked">Locked</Option>
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
                    <TableHeaderCell className="text-center">
                      Average Score
                    </TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Submitted By</TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Action
                    </TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6}>
                        <TableSkeleton columns={6} rows={6} />
                      </td>
                    </tr>
                  ) : centers.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <CenteredEmptyState description="No centres configured." />
                      </td>
                    </tr>
                  ) : (
                    centers.map((center) => {
                      const centerResults = results.filter(
                        (r) => resolveId(r.centerId) === center._id,
                      );
                      const totalUploaded = centerResults.length;
                      const avgScore = totalUploaded
                        ? centerResults.reduce((s, r) => s + r.average, 0) /
                          totalUploaded
                        : 0;

                      const pub = publications.find(
                        (p) => resolveId(p.centerId) === center._id,
                      );
                      let statusKey: string = "no_uploads";
                      if (totalUploaded > 0) {
                        if (!pub) {
                          statusKey = "draft";
                        } else if (pub.status === "approved") {
                          const isLocked = centerResults.every(
                            (r) => r.status === "locked",
                          );
                          statusKey = isLocked ? "locked" : "published";
                        } else if (pub.status === "pending") {
                          statusKey = "pending_approval";
                        } else if (pub.status === "rejected") {
                          statusKey = "rejected";
                        }
                      }

                      const submittedByName = pub?.submittedBy
                        ? `${(pub.submittedBy as any).firstName} ${(pub.submittedBy as any).lastName}`
                        : null;

                      return (
                        <TableRow key={center._id}>
                          <TableCell>{center.name}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {totalUploaded}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {totalUploaded ? (
                              <span
                                style={{
                                  color: avgScore >= 50 ? "#16a34a" : "#dc2626",
                                }}
                              >
                                {avgScore.toFixed(1)}%
                              </span>
                            ) : (
                              <EmptyValue />
                            )}
                          </TableCell>
                          <TableCell>
                            <PublicationStatusBadge statusKey={statusKey} />
                          </TableCell>
                          <TableCell>
                            {submittedByName ?? <EmptyValue />}
                          </TableCell>
                          <TableCell className="text-right">
                            <Stack
                              direction="row"
                              gap={1.5}
                              justifyContent="flex-end"
                            >
                              {totalUploaded > 0 && (
                                <ActionLink
                                  onClick={() => setViewCenterId(center._id)}
                                >
                                  View Results
                                </ActionLink>
                              )}

                              {pub && pub.status === "pending" && (
                                <>
                                  <ActionLink
                                    onClick={() => handleApprove(pub._id)}
                                    variant="success"
                                  >
                                    Approve
                                  </ActionLink>
                                  <ActionLink
                                    onClick={() => handleReject(pub._id)}
                                    variant="danger"
                                  >
                                    Reject
                                  </ActionLink>
                                </>
                              )}

                              {pub && pub.status === "approved" &&
                                statusKey !== "locked" && (
                                  <ActionLink
                                    onClick={() => handleLock(center._id)}
                                    variant="muted"
                                  >
                                    Lock
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
            ) : (
              <table className="w-full text-sm text-left">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Matric No.</TableHeaderCell>
                    <TableHeaderCell>Centre</TableHeaderCell>
                    <TableHeaderCell>Session</TableHeaderCell>
                    <TableHeaderCell>Term</TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Average
                    </TableHeaderCell>
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
                      <td colSpan={9}>
                        <TableSkeleton columns={9} rows={6} />
                      </td>
                    </tr>
                  ) : displayedResults.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
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
                          <TableCell>{resolveName(r.centerId as any)}</TableCell>
                          <TableCell>{resolveName(r.sessionId as any)}</TableCell>
                          <TableCell>{resolveName(r.termId as any)}</TableCell>
                          <TableCell className="text-center font-semibold">
                            <span
                              style={{
                                color: r.average >= 50 ? "#16a34a" : "#dc2626",
                              }}
                            >
                              {r.average.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={r.status}
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
                              {isCoordinator && r.status === "draft" && (
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
    </Frame>
  );
};

export default ResultsPage;

const PublicationStatusBadge = ({ statusKey }: { statusKey: string }) => {
  const map: Record<
    string,
    { color: "success" | "warning" | "danger" | "neutral" | "primary"; label: string }
  > = {
    no_uploads: { color: "neutral", label: "No Uploads" },
    draft: { color: "neutral", label: "Draft" },
    published: { color: "success", label: "Published" },
    locked: { color: "primary", label: "Locked" },
    pending_approval: { color: "warning", label: "Pending Approval" },
    rejected: { color: "danger", label: "Rejected" },
  };
  const c = map[statusKey] || map.no_uploads;
  return <StatusBadge status={statusKey} map={map} />;
};
