import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chip,
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
import { CenteredEmptyState, TableSkeleton } from "../../components/query-state/QueryStates";
import { STATUS_COLOR, resolveId, resolveName } from "../../utils/academic";
import moment from "moment";
import { toast } from "react-toastify";
import { handleError } from "../../utils";

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

  // Load terms only for the selected session
  const { data: termsRes } = useGetTermsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId }
  );
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const { data: centersRes } = useGetCentersQuery({ page: 1, limit: 100 }, { skip: !isAdmin });
  const centers = centersRes?.data?.docs ?? [];

  const { data: publicationsRes } = useGetPublicationsQuery(
    sessionId && termId ? { sessionId, termId } : undefined,
    { skip: !sessionId || !termId }
  );
  const publications = (publicationsRes?.data as unknown as ResultPublication[]) ?? [];

  const { data, isLoading } = useGetResultsQuery({
    ...(sessionId ? { sessionId } : {}),
    ...(termId ? { termId } : {}),
    ...(status ? { status } : {}),
    ...(isCoordinator && coordinatorCenterId ? { centerId: coordinatorCenterId } : {}),
  });

  const [approvePublication] = useApprovePublicationMutation();
  const [rejectPublication] = useRejectPublicationMutation();
  const [lockResults] = useLockResultsMutation();

  const results = (data?.data as unknown as StudentResult[]) ?? [];

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

  const handleApprove = async (pubId: string) => {
    if (!window.confirm("Are you sure you want to approve this centre's results? This will publish the results to students.")) return;
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
    if (!window.confirm("Are you sure you want to lock this centre's results? This will prevent any further edits by coordinators.")) return;
    try {
      await lockResults({ sessionId, termId, centerId }).unwrap();
      toast.success("Results locked successfully");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  // Filter results for detailed view
  const displayedResults = viewCenterId
    ? results.filter((r) => resolveId(r.centerId) === viewCenterId)
    : results;

  return (
    <Frame text="Academic Results">
      {/* Top action bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mt={3}>
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
            <AppButton variant="outlined" onClick={() => navigate("/dashboard/results/bulk-upload")}>
              Bulk Upload (Excel)
            </AppButton>
            <AppButton variant="outlined" onClick={() => navigate("/dashboard/results/submit")}>
              Submit for Publication
            </AppButton>
          </Stack>
        )}
        {isAdmin && (
          <Stack direction="row" gap={2} flexWrap="wrap">
            <AppButton variant="outlined" onClick={() => navigate("/dashboard/results/analytics")}>
              Analytics
            </AppButton>
            <AppButton variant="outlined" onClick={() => navigate("/dashboard/results/reports")}>
              Reports
            </AppButton>
          </Stack>
        )}
      </Stack>

      {/* Filters */}
      <Stack direction="row" gap={2} mt={4} flexWrap="wrap" alignItems="flex-end">
        <FormControl size="sm" sx={{ minWidth: 200 }}>
          <FormLabel>Session</FormLabel>
          <Select
            size="sm"
            value={sessionId}
            onChange={(_, v) => { setSessionId((v as string) ?? ""); setTermId(""); setViewCenterId(null); }}
            placeholder="Select session"
          >
            {sessions.map((s) => (
              <Option key={s._id} value={s._id}>{s.name}</Option>
            ))}
          </Select>
        </FormControl>

        <FormControl size="sm" sx={{ minWidth: 180 }}>
          <FormLabel>Term</FormLabel>
          <Select
            size="sm"
            value={termId}
            onChange={(_, v) => { setTermId((v as string) ?? ""); setViewCenterId(null); }}
            placeholder={sessionId ? "Select term" : "Select session first"}
            disabled={!sessionId}
          >
            {terms.map((t) => (
              <Option key={t._id} value={t._id}>{t.name}</Option>
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

      {/* View Header toggle for detail view */}
      {isAdmin && viewCenterId && (
        <Stack direction="row" alignItems="center" gap={2} mt={4}>
          <AppButton size="sm" variant="outlined" onClick={() => setViewCenterId(null)}>
            ← Back to Centres
          </AppButton>
          <Typography level="title-md">
            Results for: {centers.find(c => c._id === viewCenterId)?.name ?? "Selected Centre"}
          </Typography>
        </Stack>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl mt-6 overflow-x-auto shadow-sm border border-[#E6ECFF]">
        {isAdmin && !viewCenterId ? (
          /* Centers view for Admin */
          <table className="w-full text-sm text-left text-[#001F54]">
            <thead className="bg-[#F5FAFF] text-xs font-semibold text-[#475569] uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3">Centre</th>
                <th className="px-5 py-3 text-center">Students Uploaded</th>
                <th className="px-5 py-3 text-center">Average Score</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted By</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6}><TableSkeleton columns={6} rows={6} /></td></tr>
              ) : centers.length === 0 ? (
                <tr><td colSpan={6}><CenteredEmptyState description="No centres configured." /></td></tr>
              ) : (
                (() => {
                  return centers.map((center) => {
                    const centerResults = results.filter((r) => resolveId(r.centerId) === center._id);
                    const totalUploaded = centerResults.length;
                    const avgScore = totalUploaded
                      ? centerResults.reduce((s, r) => s + r.average, 0) / totalUploaded
                      : 0;

                    const pub = publications.find((p) => resolveId(p.centerId) === center._id);
                    let statusStr = "No Uploads";
                    let statusColor: any = "neutral";
                    if (totalUploaded > 0) {
                      if (!pub) {
                        statusStr = "Draft";
                        statusColor = "neutral";
                      } else if (pub.status === "approved") {
                        const isLocked = centerResults.every((r) => r.status === "locked");
                        statusStr = isLocked ? "Locked" : "Published";
                        statusColor = isLocked ? "primary" : "success";
                      } else if (pub.status === "pending") {
                        statusStr = "Pending Approval";
                        statusColor = "warning";
                      } else if (pub.status === "rejected") {
                        statusStr = "Rejected";
                        statusColor = "danger";
                      }
                    }

                    const submittedByName = pub?.submittedBy
                      ? `${(pub.submittedBy as any).firstName} ${(pub.submittedBy as any).lastName}`
                      : "-";

                    return (
                      <tr key={center._id} className="border-t border-[#E6ECFF] hover:bg-[#F5FAFF] transition-colors">
                        <td className="px-5 py-3 font-medium">{center.name}</td>
                        <td className="px-5 py-3 text-center font-semibold">{totalUploaded}</td>
                        <td className="px-5 py-3 text-center font-bold">
                          {totalUploaded ? (
                            <span style={{ color: avgScore >= 50 ? "#16a34a" : "#dc2626" }}>
                              {avgScore.toFixed(1)}%
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-5 py-3">
                          <Chip color={statusColor} variant="soft" size="sm">
                            {statusStr}
                          </Chip>
                        </td>
                        <td className="px-5 py-3 text-[#475569]">{submittedByName}</td>
                        <td className="px-5 py-3 text-right">
                          <Stack direction="row" gap={1.5} justifyContent="flex-end">
                            {totalUploaded > 0 && (
                              <button
                                onClick={() => setViewCenterId(center._id)}
                                className="text-xs text-[#001EC5] hover:underline font-semibold"
                              >
                                View Results
                              </button>
                            )}

                            {pub && pub.status === "pending" && (
                              <>
                                <span className="text-[#CBD5E1]">·</span>
                                <button
                                  onClick={() => handleApprove(pub._id)}
                                  className="text-xs text-[#16a34a] hover:underline font-semibold"
                                >
                                  Approve
                                </button>
                                <span className="text-[#CBD5E1]">·</span>
                                <button
                                  onClick={() => handleReject(pub._id)}
                                  className="text-xs text-[#dc2626] hover:underline font-semibold"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {pub && pub.status === "approved" && statusStr !== "Locked" && (
                              <>
                                <span className="text-[#CBD5E1]">·</span>
                                <button
                                  onClick={() => handleLock(center._id)}
                                  className="text-xs text-[#475569] hover:underline font-semibold"
                                >
                                  Lock
                                </button>
                              </>
                            )}
                          </Stack>
                        </td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        ) : (
          /* Students view (For Coordinators, or Admin detail view) */
          <table className="w-full text-sm text-left text-[#001F54]">
            <thead className="bg-[#F5FAFF] text-xs font-semibold text-[#475569] uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Matric No.</th>
                <th className="px-5 py-3">Centre</th>
                <th className="px-5 py-3">Session</th>
                <th className="px-5 py-3">Term</th>
                <th className="px-5 py-3 text-center">Average</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9}><TableSkeleton columns={9} rows={6} /></td></tr>
              ) : displayedResults.length === 0 ? (
                <tr><td colSpan={9}><CenteredEmptyState description="No results found." /></td></tr>
              ) : (
                displayedResults.map((r) => {
                  const student = r.studentId as any;
                  return (
                    <tr key={r._id} className="border-t border-[#E6ECFF] hover:bg-[#F5FAFF] transition-colors">
                      <td className="px-5 py-3 font-medium">
                        {student?.firstName} {student?.lastName}
                      </td>
                      <td className="px-5 py-3 text-[#475569]">{student?.matricNumber ?? "-"}</td>
                      <td className="px-5 py-3">{resolveName(r.centerId as any)}</td>
                      <td className="px-5 py-3">{resolveName(r.sessionId as any)}</td>
                      <td className="px-5 py-3">{resolveName(r.termId as any)}</td>
                      <td className="px-5 py-3 text-center font-semibold">
                        <span style={{ color: r.average >= 50 ? "#16a34a" : "#dc2626" }}>
                          {r.average.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Chip color={STATUS_COLOR[r.status]} variant="soft" size="sm">
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Chip>
                      </td>
                      <td className="px-5 py-3 text-[#475569] text-xs">
                        {moment(r.createdAt).format("DD MMM YYYY")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Stack direction="row" gap={1} justifyContent="flex-end">
                          <button
                            onClick={() => navigate(`/dashboard/results/${r._id}`)}
                            className="text-xs text-[#001EC5] hover:underline font-medium"
                          >
                            View
                          </button>
                          {isCoordinator && r.status === "draft" && (
                            <>
                              <span className="text-[#CBD5E1]">·</span>
                              <button
                                onClick={() => navigate(`/dashboard/results/${r._id}/edit`)}
                                className="text-xs text-[#475569] hover:underline font-medium"
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary strip */}
      {!isLoading && results.length > 0 && (
        <Stack direction="row" gap={4} mt={4} flexWrap="wrap">
          {(["draft", "submitted", "published", "locked"] as ResultStatus[]).map((s) => {
            const count = results.filter((r) => r.status === s).length;
            return (
              <div key={s} className="bg-white border border-[#E6ECFF] rounded-lg px-5 py-3 flex items-center gap-3">
                <Chip color={STATUS_COLOR[s]} variant="soft" size="sm">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Chip>
                <Typography level="title-md" fontWeight={700}>{count}</Typography>
              </div>
            );
          })}
        </Stack>
      )}
    </Frame>
  );
};

export default ResultsPage;
