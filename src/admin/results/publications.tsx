import {
  Typography,
  Stack,
  Select,
  Option,
  FormControl,
  FormLabel,
  Textarea,
} from "@mui/joy";
import { useState } from "react";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import {
  useGetPublicationsQuery,
  useApprovePublicationMutation,
  useRejectPublicationMutation,
  useLockResultsMutation,
  useGetSessionsQuery,
  useGetTermsQuery,
} from "../../data/rtk/academic";
import { resolveName } from "../../utils/academic";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import { handleError } from "../../utils";
import moment from "moment";
import { Lock } from "@mui/icons-material";
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
import { PUBLICATION_STATUS } from "../../utils/status";

const PublicationsPage = () => {
  const [statusFilter, setStatusFilter] = useState<PublicationStatus | "">("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [lockSessionId, setLockSessionId] = useState("");
  const [lockTermId, setLockTermId] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const { data: sessionsRes } = useGetSessionsQuery();
  const { data: termsRes } = useGetTermsQuery();
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

  const { data: pubRes, isLoading } = useGetPublicationsQuery(
    statusFilter ? { status: statusFilter } : {},
  );
  const publications =
    (pubRes?.data as unknown as ResultPublication[]) ?? [];

  const [approve] = useApprovePublicationMutation();
  const [reject] = useRejectPublicationMutation();
  const [lock, { isLoading: locking }] = useLockResultsMutation();

  const handleApprove = async (id: string) => {
    if (!window.confirm("Approve and publish these results?")) return;
    setActionId(id);
    try {
      await approve(id).unwrap();
      toast.success("Results published successfully!");
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActionId(rejectId);
    try {
      await reject({ id: rejectId, rejectionReason: rejectReason }).unwrap();
      toast.success("Publication rejected — results returned to draft.");
      setRejectId(null);
      setRejectReason("");
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setActionId(null);
    }
  };

  const handleLock = async () => {
    if (!lockSessionId) return toast.error("Select a session to lock");
    try {
      await lock({
        sessionId: lockSessionId,
        ...(lockTermId ? { termId: lockTermId } : {}),
      }).unwrap();
      toast.success("Results locked successfully!");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const pending = publications.filter((p) => p.status === "pending").length;

  return (
    <Frame text="Publications Queue">
      <div className="space-y-6 mt-6 pb-16">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#001F54] to-[#001EC5] rounded-2xl p-6 text-white">
            <Typography level="body-sm" sx={{ color: "#bfdbfe" }}>
              Pending Approvals
            </Typography>
            <Typography
              level="h2"
              sx={{ color: "white", fontWeight: 900, my: 1 }}
            >
              {pending}
            </Typography>
            <Typography level="body-xs" sx={{ color: "#93c5fd" }}>
              {pending > 0
                ? "Action required — review below"
                : "All clear, no pending submissions"}
            </Typography>
          </div>

          <PageCard>
            <Typography
              level="title-sm"
              sx={{ color: "#001F54", display: "flex", alignItems: "center" }}
            >
              <Lock sx={{ fontSize: 16, mr: 0.5 }} /> Lock Published Results
            </Typography>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <FormControl size="sm">
                <FormLabel>Session</FormLabel>
                <Select
                  placeholder="Session"
                  value={lockSessionId}
                  onChange={(_, v) => setLockSessionId(v as string)}
                >
                  {sessions.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="sm">
                <FormLabel>Term (optional)</FormLabel>
                <Select
                  placeholder="All terms"
                  value={lockTermId}
                  onChange={(_, v) => setLockTermId(v as string)}
                >
                  <Option value="">All terms</Option>
                  {terms.map((t) => (
                    <Option key={t._id} value={t._id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </div>
            <AppButton
              onClick={handleLock}
              loading={locking}
              variant="outlined"
              className="mt-3"
            >
              Lock Results
            </AppButton>
          </PageCard>
        </div>

        <PageCard padded={false}>
          <div className="px-6 pt-6 pb-2">
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
                Submission History
              </Typography>
              <FormControl size="sm" sx={{ minWidth: 160 }}>
                <FormLabel>Status</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(_, v) =>
                    setStatusFilter((v as PublicationStatus | "") ?? "")
                  }
                >
                  <Option value="">All</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </FormControl>
            </Stack>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Centre</TableHeaderCell>
                  <TableHeaderCell>Session</TableHeaderCell>
                  <TableHeaderCell>Term</TableHeaderCell>
                  <TableHeaderCell>Submitted By</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7}>
                      <TableSkeleton columns={7} rows={5} />
                    </td>
                  </tr>
                ) : publications.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <CenteredEmptyState description="No publication requests found." />
                    </td>
                  </tr>
                ) : (
                  publications.map((p) => {
                    const sub = p.submittedBy as any;
                    return (
                      <TableRow key={p._id}>
                        <TableCell>
                          {resolveName(p.centerId as any)}
                        </TableCell>
                        <TableCell>
                          {resolveName(p.sessionId as any)}
                        </TableCell>
                        <TableCell>{resolveName(p.termId as any)}</TableCell>
                        <TableCell>
                          {sub?.firstName ? (
                            `${sub.firstName} ${sub.lastName}`
                          ) : (
                            <EmptyValue />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[#94a3b8]">
                            {moment(p.createdAt).format("DD MMM YYYY")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={p.status}
                            map={PUBLICATION_STATUS}
                          />
                        </TableCell>
                        <TableCell>
                          {p.status === "pending" && (
                            <Stack direction="row" gap={1.5}>
                              <AppButton
                                size="sm"
                                onClick={() => handleApprove(p._id)}
                                loading={actionId === p._id}
                              >
                                Approve
                              </AppButton>
                              <AppButton
                                size="sm"
                                variant="outlined"
                                color="danger"
                                onClick={() => {
                                  setRejectId(p._id);
                                  setRejectReason("");
                                }}
                              >
                                Reject
                              </AppButton>
                            </Stack>
                          )}
                          {p.status === "rejected" && p.rejectionReason && (
                            <Typography
                              level="body-xs"
                              sx={{ color: "#991B1B" }}
                            >
                              {p.rejectionReason}
                            </Typography>
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

      {rejectId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl grid gap-4">
            <Typography level="title-md">Reject Publication</Typography>
            <Typography level="body-sm" textColor="neutral.600">
              Provide a reason for rejection. Results will be returned to draft.
            </Typography>
            <Textarea
              placeholder="Reason for rejection (optional)"
              minRows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <Stack direction="row" gap={2} justifyContent="flex-end">
              <AppButton
                variant="outlined"
                onClick={() => setRejectId(null)}
              >
                Cancel
              </AppButton>
              <AppButton
                color="danger"
                onClick={handleReject}
                loading={actionId === rejectId}
              >
                Confirm Reject
              </AppButton>
            </Stack>
          </div>
        </div>
      )}
    </Frame>
  );
};

export default PublicationsPage;
