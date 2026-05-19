import { useState } from "react";
import Frame from "../../components/frame/Frame";
import { Box, Button, Card, Chip, Divider, Stack, Typography } from "@mui/joy";
import AppModal from "../../components/modal/modal";
import { useGetPaymentsQuery } from "../../data/rtk/payment";
import moment from "moment";
import { useSelector } from "react-redux";
import { selectUser } from "../../data/selectors/authSelector";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/Button/AppButton";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../../utils";
import { openFinancialReportPrintPreview } from "./report-template";
import AppPagination from "../../components/pagination/Pagination";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import {
  useGetRemittancesQuery,
  useConfirmRemittanceMutation,
  useRejectRemittanceMutation,
} from "../../data/rtk/remittance";
import { getUserFullName } from "../../utils";

type CenterBreakdown = {
  centerName: string;
  transactions: number;
  amount: number;
};

type FinancialReport = {
  scopeLabel: string;
  generatedAt: string;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  averageAmount: number;
  dateFrom?: string;
  dateTo?: string;
  centerBreakdown: CenterBreakdown[];
};

const formatCurrency = (kobo: number) => {
  return `$${(kobo / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const isSuccessfulPayment = (status?: string) => {
  const value = (status || "").toLowerCase();
  return ["paid", "success", "successful", "succeeded", "completed"].includes(
    value,
  );
};

const isFailedPayment = (status?: string) => {
  const value = (status || "").toLowerCase();
  return ["failed", "cancelled", "canceled", "error"].includes(value);
};

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

const getCenterNameFromPayment = (payment: Payment) => {
  const student = getStudentFromPayment(payment);

  if (!student || !student.center) return "-";
  if (typeof student.center === "string") return "-";

  return student.center.name || "-";
};

const Payments = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "student_payments" | "pending_remittances" | "remittance_history"
  >("student_payments");
  const user = useSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";
  const isCoordinator = user?.type === "coordinator";
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : user?.center?._id;

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  // Queries for KPI summary cards & badges
  const { data: pendingRemittances } = useGetRemittancesQuery(
    { limit: 50, status: "pending_confirmation" },
    { skip: !isAdmin },
  );

  const { data: historicalRemittances } = useGetRemittancesQuery(
    { page: 1, limit: 10 },
    { skip: !isAdmin },
  );

  const { data: payments } = useGetPaymentsQuery(
    {
      page: 1,
      limit: 10,
      ...(isCoordinator && coordinatorCenterId
        ? { center: coordinatorCenterId }
        : {}),
    },
    { skip: isCoordinator && !coordinatorCenterId },
  );

  const pendingCount = pendingRemittances?.data?.docs?.length || 0;
  const pendingSum =
    pendingRemittances?.data?.docs?.reduce(
      (sum, r) => sum + (r.amount || 0),
      0,
    ) || 0;

  return (
    <Frame text="Payments">
      <div className="pb-16">
        {/* KPI Stats Cards (Admin Only) */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-10">
            {/* Card 1: Student Payments */}
            <div className="bg-white p-4 rounded-md space-y-2">
              <Typography level="h3">
                {payments?.data?.totalItems ?? 0}
              </Typography>
              <Typography level="body-md" textColor="#000000">
                Total Student Payments
              </Typography>
            </div>

            {/* Card 2: Pending Coordinator Remittances */}
            <div className="bg-white p-4 rounded-md space-y-2">
              <Typography level="h3">{pendingCount}</Typography>
              <Typography level="body-md" textColor="#000000">
                Pending Remittances
              </Typography>
            </div>

            {/* Card 3: Settled Remittances */}
            <div className="bg-white p-4 rounded-md space-y-2">
              <Typography level="h3">
                {historicalRemittances?.data?.totalItems ?? 0}
              </Typography>
              <Typography level="body-md" textColor="#000000">
                Settled Remittances
              </Typography>
            </div>
          </div>
        )}

        {isAdmin ? (
          <div className="mt-6 flex flex-col gap-4">
            {/* Admin Tabs */}
            <div className="flex gap-6 mb-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("student_payments")}
                className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === "student_payments"
                    ? "text-[#001F54] border-b-2 border-[#001F54]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Student Payments
              </button>
              <button
                onClick={() => setActiveTab("pending_remittances")}
                className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === "pending_remittances"
                    ? "text-[#001F54] border-b-2 border-[#001F54]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Pending Remittances
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-amber-500 rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("remittance_history")}
                className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === "remittance_history"
                    ? "text-[#001F54] border-b-2 border-[#001F54]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Remittance History
              </button>
            </div>

            {/* Tab Contents */}
            <div className="transition-all duration-300">
              {activeTab === "student_payments" && <TransactionTable />}

              {activeTab === "pending_remittances" && <PendingRemittances />}

              {activeTab === "remittance_history" && <AdminRemittanceHistory />}
            </div>
          </div>
        ) : (
          /* Coordinator View (Single table, no tabs) */
          <div className="mt-4 flex flex-col gap-6">
            <TransactionTable />
          </div>
        )}

        <AppModal isOpen={isOpen} close={toggleModal}>
          <div></div>
        </AppModal>
      </div>
    </Frame>
  );
};

export default Payments;

const TransactionTable = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isCoordinator = user?.type === "coordinator";
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : user?.center?._id;
  const coordinatorCenterName =
    user?.center && typeof user.center !== "string"
      ? user.center.name
      : undefined;
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [page, setPage] = useState(1);
  const { data: payments, isLoading } = useGetPaymentsQuery(
    {
      page,
      limit: 10,
      ...(isCoordinator && coordinatorCenterId
        ? { center: coordinatorCenterId }
        : {}),
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
      const fetchedPayments: Payment[] = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "100");

        if (isCoordinator && coordinatorCenterId) {
          params.set("center", coordinatorCenterId);
        }

        const res = await axios.get<ApiResponse<Payment>>(
          `/payment?${params.toString()}`,
        );

        const docs = res?.data?.data?.docs || [];
        fetchedPayments.push(...docs);

        hasNextPage = Boolean(res?.data?.data?.hasNextPage);
        page += 1;
      }

      const totalTransactions = fetchedPayments.length;
      const successfulTransactions = fetchedPayments.filter((payment) =>
        isSuccessfulPayment(payment.status),
      ).length;
      const failedTransactions = fetchedPayments.filter((payment) =>
        isFailedPayment(payment.status),
      ).length;
      const pendingTransactions =
        totalTransactions - successfulTransactions - failedTransactions;
      const totalAmount = fetchedPayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0,
      );
      const averageAmount = totalTransactions
        ? Math.round(totalAmount / totalTransactions)
        : 0;

      const timestamps = fetchedPayments
        .map((payment) => new Date(payment.createdAt).getTime())
        .filter((value) => Number.isFinite(value));

      const minTime = timestamps.length ? Math.min(...timestamps) : undefined;
      const maxTime = timestamps.length ? Math.max(...timestamps) : undefined;

      const centerMap = new Map<
        string,
        { transactions: number; amount: number }
      >();

      fetchedPayments.forEach((payment) => {
        const centerName = isCoordinator
          ? coordinatorCenterName || "Coordinator Center"
          : getCenterNameFromPayment(payment);
        const prev = centerMap.get(centerName) || {
          transactions: 0,
          amount: 0,
        };
        centerMap.set(centerName, {
          transactions: prev.transactions + 1,
          amount: prev.amount + (payment.amount || 0),
        });
      });

      const centerBreakdown: CenterBreakdown[] = Array.from(centerMap.entries())
        .map(([centerName, stats]) => ({
          centerName,
          transactions: stats.transactions,
          amount: stats.amount,
        }))
        .sort((a, b) => b.amount - a.amount);

      const report: FinancialReport = {
        scopeLabel: isCoordinator
          ? `${coordinatorCenterName || "My Center"} (Coordinator)`
          : "All Centers (Admin)",
        generatedAt: moment().format("MM/DD/YYYY, HH:mm"),
        totalTransactions,
        successfulTransactions,
        pendingTransactions,
        failedTransactions,
        totalAmount,
        averageAmount,
        dateFrom: minTime ? moment(minTime).format("MM/DD/YYYY") : undefined,
        dateTo: maxTime ? moment(maxTime).format("MM/DD/YYYY") : undefined,
        centerBreakdown,
      };

      const didOpenPreview = openFinancialReportPrintPreview({
        report: {
          scopeLabel: report.scopeLabel,
          generatedAt: report.generatedAt,
          totalTransactions: report.totalTransactions,
          successfulTransactions: report.successfulTransactions,
          pendingTransactions: report.pendingTransactions,
          failedTransactions: report.failedTransactions,
          totalAmountFormatted: formatCurrency(report.totalAmount),
          averageAmountFormatted: formatCurrency(report.averageAmount),
          dateFrom: report.dateFrom,
          dateTo: report.dateTo,
          centerBreakdown: report.centerBreakdown.map((center) => ({
            centerName: center.centerName,
            transactions: center.transactions,
            amountFormatted: formatCurrency(center.amount),
          })),
        },
        transactions: fetchedPayments.map((payment) => ({
          date: moment(payment.createdAt).format("MM/DD/YYYY"),
          transactionRef: payment._id,
          description: payment.description || "Registration Fee",
          center: getCenterNameFromPayment(payment),
          status: payment.status,
          amountFormatted: formatCurrency(payment.amount),
        })),
      });

      if (!didOpenPreview) {
        toast.error("Unable to open report preview. Please allow popups.");
        return;
      }

      toast.success("Financial report generated.");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <div>
          <Typography level="title-lg">
            Student Registration Payments
          </Typography>
          <Typography level="body-sm" sx={{ mt: 0.5, color: "text.tertiary" }}>
            Payments made by students for registration and courses.
          </Typography>
        </div>
        <AppButton
          type="button"
          loading={isGeneratingReport}
          disabled={isGeneratingReport}
          onClick={generateFinancialReport}
        >
          Generate Report
        </AppButton>
      </Box>
      <Divider />
      <Box sx={{ p: 3 }}>
        <Box
          minHeight={400}
          position={"relative"}
          className={"overflow-x-auto scrollbar-hide w-full"}
        >
          <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
            <thead className="text-xs whitespace-nowrap">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Transaction Ref
                </th>
                <th scope="col" className="px-6 py-3">
                  Description
                </th>
                {!isCoordinator && (
                  <th scope="col" className="px-6 py-3">
                    Center
                  </th>
                )}
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="whitespace-nowrap">
              {isLoading && !hasPayments ? (
                <tr>
                  <td colSpan={isCoordinator ? 6 : 7}>
                    <div className="px-4 py-4">
                      <TableSkeleton columns={isCoordinator ? 6 : 7} rows={6} />
                    </div>
                  </td>
                </tr>
              ) : hasPayments ? (
                payments?.data.docs.map((payment) => {
                  const payerId = getPayerId(payment);

                  return (
                    <tr
                      className="border-b last:border-none font-medium"
                      key={payment._id}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {moment(payment?.createdAt).format("MM/DD/YYYY")}
                      </td>
                      <td className="px-6 py-4">{payment?._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment?.description || "Registration Fee"}
                      </td>
                      {!isCoordinator && (
                        <td className="px-6 py-4">
                          {getCenterNameFromPayment(payment)}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        ${(payment.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">{payment?.status}</td>
                      <td className="px-6 py-4">
                        <AppButton
                          type="button"
                          disabled={!payerId}
                          onClick={() => navigate(`/payments/users/${payerId}`)}
                        >
                          Payer
                        </AppButton>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isCoordinator ? 6 : 7}>
                    <CenteredEmptyState description="No payments yet" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {totalPages > 1 && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <AppPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
};

/* ────── Pending Remittances (Admin Only) ────── */

const PendingRemittances = () => {
  const { data: remittances, isLoading } = useGetRemittancesQuery({
    limit: 50,
    status: "pending_confirmation",
  });
  const [confirmRemittance] = useConfirmRemittanceMutation();
  const [rejectRemittance] = useRejectRemittanceMutation();
  const [actionId, setActionId] = useState<string | null>(null);

  const docs = remittances?.data?.docs || [];
  const hasDocs = docs.length > 0;

  const getCoordinatorName = (r: Remittance) => {
    if (typeof r.coordinatorId === "string") return r.coordinatorId;
    return getUserFullName(r.coordinatorId as User);
  };

  const getCenterName = (r: Remittance) => {
    if (typeof r.centerId === "string") return "-";
    return (r.centerId as Center)?.name || "-";
  };

  const handleConfirm = async (id: string) => {
    if (!window.confirm("Confirm this remittance as received?")) return;
    setActionId(id);
    try {
      await confirmRemittance(id).unwrap();
      toast.success("Remittance confirmed");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return; // user cancelled
    setActionId(id);
    try {
      await rejectRemittance({ id, reason: reason || undefined }).unwrap();
      toast.success("Remittance rejected");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setActionId(null);
    }
  };

  if (!isLoading && !hasDocs) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-12 text-center max-w-xl mx-auto shadow-sm my-4 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
          <svg
            className="w-8 h-8 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <Typography
          level="title-lg"
          sx={{ textColor: "#001F54", fontWeight: 700 }}
        >
          All Caught Up!
        </Typography>
        <Typography level="body-sm" sx={{ color: "text.secondary" }}>
          There are no pending coordinator remittances requiring your
          confirmation at the moment.
        </Typography>
      </div>
    );
  }

  return (
    <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <div>
            <Typography level="title-lg">Pending Remittances</Typography>
            <Typography
              level="body-sm"
              sx={{ mt: 0.5, color: "text.tertiary" }}
            >
              Coordinator payments awaiting your confirmation
            </Typography>
          </div>
          {hasDocs && (
            <Chip color="warning" variant="solid" size="lg">
              {docs.length}
            </Chip>
          )}
        </Stack>
      </Box>
      <Divider />
      <Box className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
          <thead className="text-xs whitespace-nowrap">
            <tr>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Coordinator
              </th>
              <th scope="col" className="px-6 py-3">
                Center
              </th>
              <th scope="col" className="px-6 py-3">
                Method
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="whitespace-nowrap">
            {isLoading && !hasDocs ? (
              <tr>
                <td colSpan={7}>
                  <TableSkeleton columns={7} rows={3} />
                </td>
              </tr>
            ) : (
              docs.map((r) => (
                <tr
                  className="border-b last:border-none font-medium"
                  key={r._id}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {moment(r.createdAt).format("MM/DD/YYYY")}
                  </td>
                  <td className="px-6 py-4">{getCoordinatorName(r)}</td>
                  <td className="px-6 py-4">{getCenterName(r)}</td>
                  <td className="px-6 py-4">
                    <Chip
                      variant="outlined"
                      size="sm"
                      sx={{
                        borderColor:
                          r.method === "stripe" ? "#635BFF" : "#6D28D9",
                        color: r.method === "stripe" ? "#635BFF" : "#6D28D9",
                      }}
                    >
                      {r.method === "stripe" ? "Stripe" : "Zelle"}
                    </Chip>
                  </td>
                  <td className="px-6 py-4">{formatCurrency(r.amount)}</td>
                  <td className="px-6 py-4">{r.description || "-"}</td>
                  <td className="px-6 py-4">
                    <Stack direction="row" gap={1}>
                      <Button
                        size="sm"
                        color="success"
                        variant="solid"
                        disabled={actionId === r._id}
                        onClick={() => handleConfirm(r._id)}
                        sx={{ fontWeight: 600 }}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="outlined"
                        disabled={actionId === r._id}
                        onClick={() => handleReject(r._id)}
                        sx={{ fontWeight: 600 }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
    </Card>
  );
};

/* ────── Admin Remittance History ────── */

const AdminRemittanceHistory = () => {
  const [page, setPage] = useState(1);
  const { data: remittances, isLoading } = useGetRemittancesQuery({
    page,
    limit: 10,
  });

  const docs = remittances?.data?.docs || [];
  const hasDocs = docs.length > 0;
  const totalPages = remittances?.data?.totalPages || 1;

  const getCoordinatorName = (r: Remittance) => {
    if (typeof r.coordinatorId === "string") return r.coordinatorId;
    return getUserFullName(r.coordinatorId as User);
  };

  const getCenterName = (r: Remittance) => {
    if (typeof r.centerId === "string") return "-";
    return (r.centerId as Center)?.name || "-";
  };

  const getStatusChip = (status: Remittance["status"]) => {
    const config: Record<
      Remittance["status"],
      { color: "success" | "warning" | "danger"; label: string }
    > = {
      paid: { color: "success", label: "Confirmed" },
      pending_confirmation: { color: "warning", label: "Pending" },
      rejected: { color: "danger", label: "Rejected" },
    };
    const c = config[status] || { color: "warning" as const, label: status };
    return (
      <Chip color={c.color} variant="soft" size="sm">
        {c.label}
      </Chip>
    );
  };

  return (
    <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography level="title-lg">Coordinator Remittance History</Typography>
        <Typography level="body-sm" sx={{ mt: 0.5, color: "text.tertiary" }}>
          All historical remittances from center coordinators.
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 3 }}>
        <Box className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
            <thead className="text-xs whitespace-nowrap">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Coordinator
                </th>
                <th scope="col" className="px-6 py-3">
                  Center
                </th>
                <th scope="col" className="px-6 py-3">
                  Method
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="whitespace-nowrap">
              {isLoading && !hasDocs ? (
                <tr>
                  <td colSpan={6}>
                    <TableSkeleton columns={6} rows={5} />
                  </td>
                </tr>
              ) : hasDocs ? (
                docs.map((r) => (
                  <tr
                    className="border-b last:border-none font-medium"
                    key={r._id}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {moment(r.createdAt).format("MM/DD/YYYY")}
                    </td>
                    <td className="px-6 py-4">{getCoordinatorName(r)}</td>
                    <td className="px-6 py-4">{getCenterName(r)}</td>
                    <td className="px-6 py-4">
                      <Chip
                        variant="outlined"
                        size="sm"
                        sx={{
                          borderColor:
                            r.method === "stripe" ? "#635BFF" : "#6D28D9",
                          color: r.method === "stripe" ? "#635BFF" : "#6D28D9",
                        }}
                      >
                        {r.method === "stripe" ? "Stripe" : "Zelle"}
                      </Chip>
                    </td>
                    <td className="px-6 py-4">{formatCurrency(r.amount)}</td>
                    <td className="px-6 py-4">{getStatusChip(r.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <CenteredEmptyState description="No remittance history found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
        {totalPages > 1 && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <AppPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
};
