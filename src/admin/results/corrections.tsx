import {
  Typography,
  Stack,
  Select,
  Option,
  FormControl,
  FormLabel,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  Textarea,
  Box,
} from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import {
  useGetCorrectionsQuery,
  useResolveCorrectionMutation,
  useGetSessionsQuery,
} from "../../data/rtk/academic";
import { useGetCentersQuery } from "../../data/rtk/center";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import { handleError, getUserFullName } from "../../utils";
import moment from "moment";
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
import { CORRECTION_STATUS } from "../../utils/status";
import { resolveName } from "../../utils/academic";

const CorrectionsPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<CorrectionStatus | "">("");
  const [sessionId, setSessionId] = useState("");
  const [centerId, setCenterId] = useState("");
  const [rejectFor, setRejectFor] = useState<{
    id: string;
    studentName: string;
    yearName: string;
  } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const { data: sessionsRes } = useGetSessionsQuery();
  const { data: centersRes } = useGetCentersQuery({ page: 1, limit: 100 });
  const sessionsData = (sessionsRes ?? []) as unknown as AcademicSession[];
  const sessions = sessionsData;
  const centers = centersRes?.data?.docs ?? [];

  const { data: corrRes = [], isLoading } = useGetCorrectionsQuery({
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(sessionId ? { sessionId } : {}),
    ...(centerId ? { centerId } : {}),
  });
  const corrections = corrRes as unknown as ScoreCorrection[];

  const [resolveCorrection] = useResolveCorrectionMutation();

  const handleApprove = async (id: string, studentName: string) => {
    if (
      !window.confirm(
        `Approve correction for ${studentName}? This will update the student's year score on their result.`,
      )
    )
      return;
    setActionId(id);
    try {
      await resolveCorrection({ id, status: "approved" }).unwrap();
      toast.success("Correction approved and score updated");
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectFor) return;
    setActionId(rejectFor.id);
    try {
      await resolveCorrection({
        id: rejectFor.id,
        status: "rejected",
        rejectionReason: rejectNote.trim() || null,
      }).unwrap();
      toast.success("Correction rejected");
      setRejectFor(null);
      setRejectNote("");
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setActionId(null);
    }
  };

  const pending = corrections.filter((c) => c.status === "pending").length;

  return (
    <Frame text="Score Corrections">
      <div className="space-y-6 mt-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#001F54] to-[#001EC5] rounded-2xl p-5 text-white">
            <Typography level="body-sm" sx={{ color: "#bfdbfe" }}>
              Pending Requests
            </Typography>
            <Typography
              level="h2"
              sx={{ color: "white", fontWeight: 900, my: 1 }}
            >
              {pending}
            </Typography>
            <Typography level="body-xs" sx={{ color: "#93c5fd" }}>
              Awaiting your review below
            </Typography>
          </div>
          <div className="bg-white border border-[#E6ECFF] rounded-2xl p-5">
            <Typography level="body-xs" textColor="#6B7280">
              Approved
            </Typography>
            <Typography
              level="h2"
              sx={{ color: "#16a34a", fontWeight: 900, mt: 0.5 }}
            >
              {corrections.filter((c) => c.status === "approved").length}
            </Typography>
          </div>
          <div className="bg-white border border-[#E6ECFF] rounded-2xl p-5">
            <Typography level="body-xs" textColor="#6B7280">
              Rejected
            </Typography>
            <Typography
              level="h2"
              sx={{ color: "#dc2626", fontWeight: 900, mt: 0.5 }}
            >
              {corrections.filter((c) => c.status === "rejected").length}
            </Typography>
          </div>
        </div>

        <PageCard padded={false}>
          <div className="px-6 py-4">
            <Stack
              direction="row"
              gap={2}
              alignItems="flex-end"
              flexWrap="wrap"
            >
              <Typography
                level="title-lg"
                sx={{ mr: "auto", color: "#001F54" }}
              >
                Correction Requests
              </Typography>
              <FormControl size="sm" sx={{ minWidth: 160 }}>
                <FormLabel>Status</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(_, v) =>
                    setStatusFilter((v as CorrectionStatus | "") ?? "")
                  }
                >
                  <Option value="">All</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </FormControl>
              <FormControl size="sm" sx={{ minWidth: 180 }}>
                <FormLabel>Session</FormLabel>
                <Select
                  value={sessionId}
                  onChange={(_, v) => setSessionId(v as string)}
                  placeholder="All sessions"
                >
                  <Option value="">All sessions</Option>
                  {sessions.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="sm" sx={{ minWidth: 200 }}>
                <FormLabel>Centre</FormLabel>
                <Select
                  value={centerId}
                  onChange={(_, v) => setCenterId(v as string)}
                  placeholder="All centres"
                >
                  <Option value="">All centres</Option>
                  {centers.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Student</TableHeaderCell>
                  <TableHeaderCell>Centre</TableHeaderCell>
                  <TableHeaderCell>Session</TableHeaderCell>
                  <TableHeaderCell>Year</TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Current
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Requested
                  </TableHeaderCell>
                  <TableHeaderCell>Reason</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
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
                ) : corrections.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <CenteredEmptyState description="No correction requests found." />
                    </td>
                  </tr>
                ) : (
                  corrections.map((c) => {
                    const student = c.studentId as any;
                    const yr = c.yearId as any;
                    const result = c.resultId as any;
                    return (
                      <TableRow key={c._id}>
                        <TableCell>
                          <div className="font-semibold text-[#001F54]">
                            {getUserFullName(student)}
                          </div>
                          <div className="text-xs text-[#94A3B8]">
                            {student?.matricNumber ?? "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.centerId
                            ? resolveName(c.centerId as any)
                            : <EmptyValue />}
                        </TableCell>
                        <TableCell>
                          {c.sessionId
                            ? resolveName(c.sessionId as any)
                            : result
                              ? resolveName(result.sessionId as any)
                              : <EmptyValue />}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-[#001F54]">
                            {yr?.name ?? <EmptyValue />}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-[#475569]">
                            {c.currentScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-[#001EC5]">
                            {c.requestedScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div
                              className="text-[#475569] text-xs truncate"
                              title={c.reason}
                            >
                              {c.reason}
                            </div>
                            <div className="text-[11px] text-[#94A3B8] mt-0.5">
                              {moment(c.createdAt).format("DD MMM YYYY, HH:mm")}
                            </div>
                            {c.rejectionReason && (
                              <div
                                className="text-[11px] text-[#94A3B8] mt-0.5 italic"
                                title={`Rejection reason: ${c.rejectionReason}`}
                              >
                                Rejection reason: {c.rejectionReason}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={c.status}
                            map={CORRECTION_STATUS}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {c.status === "pending" ? (
                            <Stack
                              direction="row"
                              gap={1.5}
                              justifyContent="flex-end"
                            >
                              <AppButton
                                size="sm"
                                onClick={() =>
                                  handleApprove(
                                    c._id,
                                    getUserFullName(student) || "student",
                                  )
                                }
                                loading={actionId === c._id}
                              >
                                Approve
                              </AppButton>
                              <AppButton
                                size="sm"
                                variant="outlined"
                                color="danger"
                                onClick={() =>
                                  setRejectFor({
                                    id: c._id,
                                    studentName: getUserFullName(student),
                                    yearName: yr?.name ?? "Year",
                                  })
                                }
                                disabled={actionId === c._id}
                              >
                                Reject
                              </AppButton>
                            </Stack>
                          ) : (
                            <button
                              onClick={() => {
                                if (result && typeof result === "string") {
                                  navigate(`/dashboard/results/${result}`);
                                } else if (result?._id) {
                                  navigate(
                                    `/dashboard/results/${result._id}`,
                                  );
                                }
                              }}
                              className="text-xs font-medium text-[#001EC5] hover:underline"
                            >
                              View Result
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </table>
          </div>
        </PageCard>
      </div>

      <Modal open={Boolean(rejectFor)} onClose={() => (actionId ? null : setRejectFor(null))}>
        <ModalDialog variant="outlined" role="alertdialog">
          <ModalClose disabled={Boolean(actionId)} />
          <DialogTitle>Reject correction</DialogTitle>
          <DialogContent>
            <Stack gap={2} mt={1}>
              {rejectFor && (
                <Box className="bg-[#F5FAFF] rounded-xl p-3">
                  <Typography level="body-sm" textColor="neutral.600">
                    {rejectFor.studentName} · {rejectFor.yearName}
                  </Typography>
                </Box>
              )}
              <FormControl>
                <FormLabel>Note (optional)</FormLabel>
                <Textarea
                  minRows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Reason for rejection (visible to the student)…"
                />
              </FormControl>
            </Stack>
          </DialogContent>
          <Stack direction="row" gap={1.5} justifyContent="flex-end" mt={2}>
            <AppButton
              variant="outlined"
              onClick={() => {
                setRejectFor(null);
                setRejectNote("");
              }}
              disabled={Boolean(actionId)}
            >
              Cancel
            </AppButton>
            <AppButton
              color="danger"
              onClick={handleReject}
              loading={Boolean(actionId)}
            >
              Confirm Reject
            </AppButton>
          </Stack>
        </ModalDialog>
      </Modal>
    </Frame>
  );
};

export default CorrectionsPage;
