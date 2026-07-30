import { useEffect, useState } from "react";
import {
  Dropdown,
  FormControl,
  FormLabel,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Option,
  Select,
  Stack,
} from "@mui/joy";
import moment from "moment";
import { useSelector } from "react-redux";
import { selectUser } from "../../data/selectors/authSelector";
import { useNavigate } from "react-router-dom";
import { MoreVert } from "@mui/icons-material";
import AppButton from "../../components/Button/AppButton";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../../utils";
import { useURL } from "../../data/config";
import AppPagination from "../../components/pagination/Pagination";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import PageCard from "../../components/feedback/PageCard";
import StatusBadge from "../../components/feedback/StatusBadge";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  EmptyValue,
} from "../../components/feedback/TableShell";
import { useGetPaymentsQuery, useDeletePaymentMutation } from "../../data/rtk/payment";
import { useGetSessionsQuery } from "../../data/rtk/academic";
import { useGetCentersQuery } from "../../data/rtk/center";
import Frame from "../../components/frame/Frame";
import { PAYMENT_STATUS } from "../../utils/status";

const getStudentFromPayment = (payment: Payment) => {
  if (!payment.studentId || typeof payment.studentId === "string") {
    return null;
  }
  return payment.studentId as User & { id?: string };
};

const getPayerId = (payment: Payment) => {
  if (typeof payment.studentId === "string") return payment.studentId;
  const student = payment.studentId as User & { id?: string };
  return student?._id || student?.id;
};

const getCenterNameFromPayment = (payment: Payment): string | null => {
  const student = getStudentFromPayment(payment);
  if (!student || !student.center) return null;
  if (typeof student.center === "string") return null;
  return student.center.name || null;
};

const Payments = () => {
  const navigate = useNavigate();
  const [deletePayment] = useDeletePaymentMutation();
  const user = useSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";
  const isCoordinator = user?.type === "coordinator";
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : user?.center?._id;
  const coordinatorCenterName =
    user?.center && typeof user.center !== "string"
      ? user.center.name
      : undefined;

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: centersRes } = useGetCentersQuery(
    { limit: 100 },
    { skip: !isAdmin },
  );

  useEffect(() => {
    if (!initialized) {
      const current = sessions.find((s) => s.isCurrent);
      if (current?._id) {
        setSelectedSessionId(current._id);
        setInitialized(true);
      }
    }
  }, [sessions, initialized]);

  useEffect(() => {
    setPage(1);
  }, [selectedSessionId, selectedCenter]);

  const centers = centersRes?.data?.docs ?? [];

  const { data: payments, isLoading } = useGetPaymentsQuery(
    {
      page,
      limit: 10,
      ...(isCoordinator && coordinatorCenterId
        ? { center: coordinatorCenterId }
        : isAdmin && selectedCenter
          ? { center: selectedCenter }
          : {}),
      ...(selectedSessionId ? { sessionId: selectedSessionId } : {}),
    },
    { skip: isCoordinator && !coordinatorCenterId },
  );

  const hasPayments = Boolean(payments?.data?.docs?.length);
  const totalPages = payments?.data?.totalPages || 1;

  const generateFinancialReport = async () => {
    if (isCoordinator && !coordinatorCenterId) {
      toast.error("Coordinator center not found. Please contact admin.");
      return;
    }

    setIsGeneratingReport(true);
    try {
      const params = new URLSearchParams();
      if (isCoordinator && coordinatorCenterId) {
        params.set("center", coordinatorCenterId);
      } else if (isAdmin && selectedCenter) {
        params.set("center", selectedCenter);
      }
      if (selectedSessionId) params.set("sessionId", selectedSessionId);

      const res = await axios.get<Blob>(
        `${useURL}/financial/reports/payments/pdf?${params.toString()}`,
        { responseType: "blob" },
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const selectedSessionName = sessions.find((s) => s._id === selectedSessionId)?.name;
      link.setAttribute("download", `FinancialReport-${selectedSessionName || "All"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Financial report downloaded.");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("Delete this payment record? The student data and transaction history will be kept for audit.")) return;
    try {
      await deletePayment(paymentId).unwrap();
      toast.success("Payment deleted successfully");
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  return (
    <Frame text="Payments">
      <div className="pb-16 mt-6">
        <PageCard
          title="Student Registration Payments"
          subtitle={
            isAdmin
              ? "All student payments across centers."
              : `Payments from your center${coordinatorCenterName ? ` (${coordinatorCenterName})` : ""}.`
          }
          action={
            <AppButton
              type="button"
              loading={isGeneratingReport}
              disabled={isGeneratingReport}
              onClick={generateFinancialReport}
            >
              Generate Report
            </AppButton>
          }
          padded={false}
        >
          <div className="px-6 py-4.5">
            <Stack direction="row" gap={2} flexWrap="wrap">
              <FormControl size="sm">
                <FormLabel>Academic Session</FormLabel>
                <Select
                  size="sm"
                  value={selectedSessionId}
                  onChange={(_, val) => setSelectedSessionId((val as string) ?? "")}
                  placeholder="All Sessions"
                  sx={{ minWidth: 220 }}
                >
                  <Option value="">All Sessions</Option>
                  {sessions.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              {isAdmin && (
                <FormControl size="sm">
                  <FormLabel>Center</FormLabel>
                  <Select
                    size="sm"
                    value={selectedCenter}
                    onChange={(_, val) =>
                      setSelectedCenter((val as string) ?? "")
                    }
                    placeholder="All Centers"
                    sx={{ minWidth: 200 }}
                  >
                    <Option value="">All Centers</Option>
                    {centers.map((c) => (
                      <Option key={c._id} value={c._id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Transaction Ref</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  {!isCoordinator && <TableHeaderCell>Center</TableHeaderCell>}
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Action
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading && !hasPayments ? (
                  <tr>
                    <td colSpan={isCoordinator ? 6 : 7}>
                      <TableSkeleton columns={isCoordinator ? 6 : 7} rows={6} />
                    </td>
                  </tr>
                ) : hasPayments ? (
                  payments?.data.docs.map((payment) => {
                    const payerId = getPayerId(payment);
                    return (
                      <TableRow key={payment._id}>
                        <TableCell>
                          {moment(payment?.createdAt).format("MM/DD/YYYY")}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-[#6B7280]">
                            {payment?._id}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment?.description || "Registration Fee"}
                        </TableCell>
                        {!isCoordinator && (
                          <TableCell>
                            {getCenterNameFromPayment(payment) ?? (
                              <EmptyValue />
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          ${(payment.amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={payment?.status}
                            map={PAYMENT_STATUS}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Dropdown>
                            <MenuButton
                              slots={{ root: IconButton }}
                              slotProps={{
                                root: { variant: "outlined", color: "neutral" },
                              }}
                            >
                              <MoreVert />
                            </MenuButton>
                            <Menu>
                              {payerId ? (
                                <MenuItem
                                  onClick={() =>
                                    navigate(`/dashboard/payments/users/${payerId}`)
                                  }
                                >
                                  View
                                </MenuItem>
                              ) : (
                                <MenuItem disabled>
                                  View
                                </MenuItem>
                              )}
                              {isAdmin && (
                                <MenuItem
                                  onClick={() => handleDeletePayment(payment._id)}
                                >
                                  Delete
                                </MenuItem>
                              )}
                            </Menu>
                          </Dropdown>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isCoordinator ? 6 : 7}>
                      <CenteredEmptyState description="No payments found for the selected filters" />
                    </td>
                  </tr>
                )}
              </TableBody>
            </table>
          </div>

          {totalPages > 1 && (
            <Stack justifyContent="center" sx={{ p: 3 }}>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </Stack>
          )}
        </PageCard>
      </div>
    </Frame>
  );
};

export default Payments;
