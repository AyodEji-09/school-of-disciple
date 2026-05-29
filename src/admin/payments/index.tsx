import { useEffect, useState } from "react";
import Frame from "../../components/frame/Frame";
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
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
import {
  openFinancialReportPrintPreview,
  openRemittanceReportPrintPreview,
} from "./report-template";
import AppPagination from "../../components/pagination/Pagination";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import { useGetRemittancesQuery } from "../../data/rtk/remittance";
import {
  useGetTransactionsQuery,
  useConfirmTransactionMutation,
  useRejectTransactionMutation,
} from "../../data/rtk/transaction";
import { getUserFullName } from "../../utils";
import {
  useGetAllRegistrationWindowsQuery,
  useGetRegistrationWindowQuery,
} from "../../data/rtk/registration";
import { useGetCentersQuery } from "../../data/rtk/center";

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

/* ────────────────────────────────────────────────────────────────────────── */
/*  Payments (parent / page shell)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

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

  const toggleModal = () => setIsOpen(!isOpen);

  // KPI queries – unfiltered (all-time totals)
  const { data: pendingTransactionsRes } = useGetTransactionsQuery(
    { limit: 100, status: "pending" },
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

  const pendingCount = pendingTransactionsRes?.data?.docs?.length || 0;

  return (
    <Frame text="Payments">
      <div className="pb-16">
        {/* KPI Stats Cards (Admin Only) */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-10">
            <div className="bg-white p-4 rounded-md space-y-2">
              <Typography level="h3">
                {payments?.data?.totalItems ?? 0}
              </Typography>
              <Typography level="body-md" textColor="#000000">
                Total Student Payments
              </Typography>
            </div>
            <div className="bg-white p-4 rounded-md space-y-2">
              <Typography level="h3">{pendingCount}</Typography>
              <Typography level="body-md" textColor="#000000">
                Pending Approvals
              </Typography>
            </div>
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
                Pending Approvals
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

            <div className="transition-all duration-300">
              {activeTab === "student_payments" && <TransactionTable />}
              {activeTab === "pending_remittances" && <PendingApprovals />}
              {activeTab === "remittance_history" && <AdminRemittanceHistory />}
            </div>
          </div>
        ) : (
          /* Coordinator View */
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  TransactionTable                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

const TransactionTable = () => {
  const navigate = useNavigate();
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
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // All registration windows for year dropdown (admin-only route)
  const { data: allWindowsRes } = useGetAllRegistrationWindowsQuery(
    { page: 1, limit: 100 },
    { skip: !isAdmin },
  );

  // Current/latest window – used to set the default year
  const { data: currentWindowRes } = useGetRegistrationWindowQuery(undefined, {
    skip: isCoordinator,
  });

  // Centers for center dropdown (admin only)
  const { data: centersRes } = useGetCentersQuery(
    { limit: 100 },
    { skip: !isAdmin },
  );

  // Set the default year to the current registration window once
  useEffect(() => {
    if (!initialized && currentWindowRes?.data?.label) {
      setSelectedYear(currentWindowRes.data.label);
      setInitialized(true);
    }
  }, [currentWindowRes, initialized]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [selectedYear, selectedCenter]);

  const academicYears = allWindowsRes?.data?.docs?.map((w) => w.label) ?? [];
  const centers = centersRes?.data?.docs ?? [];

  const { data: payments, isLoading } = useGetPaymentsQuery(
    {
      page,
      limit: 10,
      // coordinators are always scoped to their own center
      ...(isCoordinator && coordinatorCenterId
        ? { center: coordinatorCenterId }
        : isAdmin && selectedCenter
          ? { center: selectedCenter }
          : {}),
      ...(selectedYear ? { academicYear: selectedYear } : {}),
    },
    { skip: isCoordinator && !coordinatorCenterId },
  );

  const hasPayments = Boolean(payments?.data?.docs?.length);
  const totalPages = payments?.data?.totalPages || 1;

  /* ── Report generation ─────────────────────────────────────────────────── */

  const generateFinancialReport = async () => {
    if (isCoordinator && !coordinatorCenterId) {
      toast.error("Coordinator center not found. Please contact admin.");
      return;
    }

    setIsGeneratingReport(true);
    try {
      const fetchedPayments: Payment[] = [];
      let pg = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const params = new URLSearchParams();
        params.set("page", String(pg));
        params.set("limit", "100");

        if (isCoordinator && coordinatorCenterId) {
          params.set("center", coordinatorCenterId);
        } else if (isAdmin && selectedCenter) {
          params.set("center", selectedCenter);
        }
        if (selectedYear) params.set("academicYear", selectedYear);

        const res = await axios.get<ApiResponse<Payment>>(
          `/payment?${params.toString()}`,
        );

        const docs = res?.data?.data?.docs ?? [];
        fetchedPayments.push(...docs);

        // Fix: the server returns `totalPages`, not `hasNextPage`
        const totalPagesCount = res?.data?.data?.totalPages ?? 1;
        hasNextPage = pg < totalPagesCount;
        pg += 1;
      }

      const totalTransactions = fetchedPayments.length;
      const successfulTransactions = fetchedPayments.filter((p) =>
        isSuccessfulPayment(p.status),
      ).length;
      const failedTransactions = fetchedPayments.filter((p) =>
        isFailedPayment(p.status),
      ).length;
      const pendingTransactions =
        totalTransactions - successfulTransactions - failedTransactions;
      const totalAmount = fetchedPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0,
      );
      const averageAmount = totalTransactions
        ? Math.round(totalAmount / totalTransactions)
        : 0;

      const timestamps = fetchedPayments
        .map((p) => new Date(p.createdAt).getTime())
        .filter((v) => Number.isFinite(v));
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
        const prev = centerMap.get(centerName) ?? {
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

      const yearLabel = selectedYear || "All Years";
      const centerLabel = isCoordinator
        ? coordinatorCenterName || "My Center"
        : selectedCenter
          ? (centers.find((c) => c._id === selectedCenter)?.name ??
            "Selected Center")
          : "All Centers";

      const report: FinancialReport = {
        scopeLabel: `${yearLabel} — ${centerLabel}`,
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
          center: isCoordinator
            ? coordinatorCenterName || "-"
            : getCenterNameFromPayment(payment),
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

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
      {/* Header */}
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
        {/* Filter Bar – admin only (coordinators are always scoped to their center) */}
        {isAdmin && (
          <Stack direction="row" gap={2} flexWrap="wrap" mb={3}>
            <FormControl size="sm">
              <FormLabel>Academic Year</FormLabel>
              <Select
                size="sm"
                value={selectedYear}
                onChange={(_, val) => setSelectedYear((val as string) ?? "")}
                placeholder="All Years"
                sx={{ minWidth: 220 }}
              >
                <Option value="">All Years</Option>
                {academicYears.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl size="sm">
              <FormLabel>Center</FormLabel>
              <Select
                size="sm"
                value={selectedCenter}
                onChange={(_, val) => setSelectedCenter((val as string) ?? "")}
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
          </Stack>
        )}

        {/* Table */}
        <Box
          minHeight={400}
          position="relative"
          className="overflow-x-auto scrollbar-hide w-full"
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
                          onClick={() =>
                            navigate(`/dashboard/payments/users/${payerId}`)
                          }
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
                    <CenteredEmptyState description="No payments found for the selected filters" />
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  PendingApprovals  (Zelle approvals across all transaction types)          */
/* ────────────────────────────────────────────────────────────────────────── */

const PendingApprovals = () => {
  const { data: transactionsRes, isLoading } = useGetTransactionsQuery({
    limit: 100,
    status: "pending",
  });
  const [confirmTransaction] = useConfirmTransactionMutation();
  const [rejectTransaction] = useRejectTransactionMutation();
  const [actionId, setActionId] = useState<string | null>(null);

  const docs = transactionsRes?.data?.docs || [];
  const hasDocs = docs.length > 0;

  const getPayerName = (t: any) => {
    if (!t.createdBy) return "-";
    const first = t.createdBy.firstName || "";
    const last = t.createdBy.lastName || "";
    return `${first} ${last}`.trim() || t.createdBy.email || "-";
  };

  const getCenterName = (t: any) => {
    return t.center?.name || "-";
  };

  const getTypeLabel = (type: string) => {
    const config: Record<
      string,
      { label: string; color: "primary" | "warning" | "success" }
    > = {
      registration: { label: "Student Registration", color: "primary" },
      remittance: { label: "Coordinator Remittance", color: "warning" },
      manual_order: { label: "Manual Order", color: "success" },
    };
    return config[type] || { label: type, color: "primary" };
  };

  const handleConfirm = async (id: string) => {
    if (!window.confirm("Confirm this transaction as received?")) return;
    setActionId(id);
    try {
      await confirmTransaction(id).unwrap();
      toast.success("Transaction confirmed successfully");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return;
    setActionId(id);
    try {
      await rejectTransaction({ id, reason: reason || undefined }).unwrap();
      toast.success("Transaction rejected");
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
          There are no pending transactions requiring your confirmation at the
          moment.
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
            <Typography level="title-lg">Pending Approvals</Typography>
            <Typography
              level="body-sm"
              sx={{ mt: 0.5, color: "text.tertiary" }}
            >
              Coordinator and student payments awaiting your confirmation
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
                Type
              </th>
              <th scope="col" className="px-6 py-3">
                Payer
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
                Receipt
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="whitespace-nowrap">
            {isLoading && !hasDocs ? (
              <tr>
                <td colSpan={9}>
                  <TableSkeleton columns={9} rows={3} />
                </td>
              </tr>
            ) : (
              docs.map((t: any) => {
                const typeInfo = getTypeLabel(t.type);
                return (
                  <tr
                    className="border-b last:border-none font-medium"
                    key={t._id}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {moment(t.createdAt).format("MM/DD/YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      <Chip color={typeInfo.color} variant="soft" size="sm">
                        {typeInfo.label}
                      </Chip>
                    </td>
                    <td className="px-6 py-4">{getPayerName(t)}</td>
                    <td className="px-6 py-4">{getCenterName(t)}</td>
                    <td className="px-6 py-4">
                      <Chip
                        variant="outlined"
                        size="sm"
                        sx={{
                          borderColor:
                            t.method === "stripe" ? "#635BFF" : "#6D28D9",
                          color: t.method === "stripe" ? "#635BFF" : "#6D28D9",
                        }}
                      >
                        {t.method === "stripe" ? "Stripe" : "Zelle"}
                      </Chip>
                    </td>
                    <td className="px-6 py-4">{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4">{t.description || "-"}</td>
                    <td className="px-6 py-4">
                      {t.zelleReceiptUrl ? (
                        <a
                          href={t.zelleReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#001EC5] underline text-xs font-medium"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="text-[#9CA3AF] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Stack direction="row" gap={1}>
                        <Button
                          size="sm"
                          color="success"
                          variant="solid"
                          disabled={actionId === t._id}
                          onClick={() => handleConfirm(t._id)}
                          sx={{ fontWeight: 600 }}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="outlined"
                          disabled={actionId === t._id}
                          onClick={() => handleReject(t._id)}
                          sx={{ fontWeight: 600 }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Box>
    </Card>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  AdminRemittanceHistory                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const AdminRemittanceHistory = () => {
  const [page, setPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // All registration windows for year dropdown
  const { data: allWindowsRes } = useGetAllRegistrationWindowsQuery({
    page: 1,
    limit: 100,
  });

  // Current/latest window – used to set the default year
  const { data: currentWindowRes } = useGetRegistrationWindowQuery();

  // Centers for center dropdown
  const { data: centersRes } = useGetCentersQuery({ limit: 100 });

  // Set the default year to the current registration window once
  useEffect(() => {
    if (!initialized && currentWindowRes?.data?.label) {
      setSelectedYear(currentWindowRes.data.label);
      setInitialized(true);
    }
  }, [currentWindowRes, initialized]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [selectedYear, selectedCenter]);

  const academicYears = allWindowsRes?.data?.docs?.map((w) => w.label) ?? [];
  const centers = centersRes?.data?.docs ?? [];

  const { data: remittances, isLoading } = useGetRemittancesQuery({
    page,
    limit: 10,
    ...(selectedYear ? { academicYear: selectedYear } : {}),
    ...(selectedCenter ? { center: selectedCenter } : {}),
  });

  const docs = remittances?.data?.docs ?? [];
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
    const c = config[status] ?? { color: "warning" as const, label: status };
    return (
      <Chip color={c.color} variant="soft" size="sm">
        {c.label}
      </Chip>
    );
  };

  /* ── Report generation ─────────────────────────────────────────────────── */

  const generateRemittanceReport = async () => {
    setIsGeneratingReport(true);
    try {
      const fetchedRemittances: Remittance[] = [];
      let pg = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const params = new URLSearchParams();
        params.set("page", String(pg));
        params.set("limit", "100");
        if (selectedYear) params.set("academicYear", selectedYear);
        if (selectedCenter) params.set("center", selectedCenter);

        const res = await axios.get<ApiResponse<Remittance>>(
          `/remittance?${params.toString()}`,
        );

        const resDocs = res?.data?.data?.docs ?? [];
        fetchedRemittances.push(...resDocs);

        const totalPagesCount = res?.data?.data?.totalPages ?? 1;
        hasNextPage = pg < totalPagesCount;
        pg += 1;
      }

      const totalRemittances = fetchedRemittances.length;
      const confirmedList = fetchedRemittances.filter(
        (r) => r.status === "paid",
      );
      const pendingList = fetchedRemittances.filter(
        (r) => r.status === "pending_confirmation",
      );
      const rejectedList = fetchedRemittances.filter(
        (r) => r.status === "rejected",
      );

      const totalConfirmedAmount = confirmedList.reduce(
        (sum, r) => sum + (r.amount || 0),
        0,
      );
      const totalAmount = fetchedRemittances.reduce(
        (sum, r) => sum + (r.amount || 0),
        0,
      );

      const timestamps = fetchedRemittances
        .map((r) => new Date(r.createdAt).getTime())
        .filter((t) => Number.isFinite(t));
      const minTime = timestamps.length ? Math.min(...timestamps) : undefined;
      const maxTime = timestamps.length ? Math.max(...timestamps) : undefined;

      // Build center breakdown
      const centerMap = new Map<
        string,
        { remittances: number; confirmedAmount: number }
      >();
      fetchedRemittances.forEach((r) => {
        const centerName = getCenterName(r);
        const prev = centerMap.get(centerName) ?? {
          remittances: 0,
          confirmedAmount: 0,
        };
        centerMap.set(centerName, {
          remittances: prev.remittances + 1,
          confirmedAmount:
            prev.confirmedAmount + (r.status === "paid" ? r.amount || 0 : 0),
        });
      });

      const centerBreakdown = Array.from(centerMap.entries())
        .map(([centerName, stats]) => ({
          centerName,
          remittances: stats.remittances,
          confirmedAmountFormatted: formatCurrency(stats.confirmedAmount),
        }))
        .sort((a, b) => b.remittances - a.remittances);

      const yearLabel = selectedYear || "All Years";
      const centerLabel = selectedCenter
        ? (centers.find((c) => c._id === selectedCenter)?.name ??
          "Selected Center")
        : "All Centers";

      const didOpenPreview = openRemittanceReportPrintPreview({
        report: {
          scopeLabel: `${yearLabel} — ${centerLabel}`,
          generatedAt: moment().format("MM/DD/YYYY, HH:mm"),
          totalRemittances,
          confirmedRemittances: confirmedList.length,
          pendingRemittances: pendingList.length,
          rejectedRemittances: rejectedList.length,
          totalConfirmedAmountFormatted: formatCurrency(totalConfirmedAmount),
          totalAmountFormatted: formatCurrency(totalAmount),
          dateFrom: minTime ? moment(minTime).format("MM/DD/YYYY") : undefined,
          dateTo: maxTime ? moment(maxTime).format("MM/DD/YYYY") : undefined,
          centerBreakdown,
        },
        remittances: fetchedRemittances.map((r) => ({
          date: moment(r.createdAt).format("MM/DD/YYYY"),
          coordinator: getCoordinatorName(r),
          center: getCenterName(r),
          method: r.method === "stripe" ? "Stripe" : "Zelle",
          amountFormatted: formatCurrency(r.amount),
          status:
            r.status === "paid"
              ? "Confirmed"
              : r.status === "pending_confirmation"
                ? "Pending"
                : "Rejected",
          description: r.description || "-",
        })),
      });

      if (!didOpenPreview) {
        toast.error("Unable to open report preview. Please allow popups.");
        return;
      }
      toast.success("Remittance report generated.");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
      {/* Header + filter bar */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={2}
          mb={3}
        >
          <div>
            <Typography level="title-lg">
              Coordinator Remittance History
            </Typography>
            <Typography
              level="body-sm"
              sx={{ mt: 0.5, color: "text.tertiary" }}
            >
              All historical remittances from center coordinators.
            </Typography>
          </div>
          <AppButton
            type="button"
            loading={isGeneratingReport}
            disabled={isGeneratingReport}
            onClick={generateRemittanceReport}
          >
            Generate Report
          </AppButton>
        </Stack>

        {/* Filter Bar */}
        <Stack direction="row" gap={2} flexWrap="wrap">
          <FormControl size="sm">
            <FormLabel>Academic Year</FormLabel>
            <Select
              size="sm"
              value={selectedYear}
              onChange={(_, val) => setSelectedYear((val as string) ?? "")}
              placeholder="All Years"
              sx={{ minWidth: 220 }}
            >
              <Option value="">All Years</Option>
              {academicYears.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl size="sm">
            <FormLabel>Center</FormLabel>
            <Select
              size="sm"
              value={selectedCenter}
              onChange={(_, val) => setSelectedCenter((val as string) ?? "")}
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
        </Stack>
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
                <th scope="col" className="px-6 py-3">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="whitespace-nowrap">
              {isLoading && !hasDocs ? (
                <tr>
                  <td colSpan={7}>
                    <TableSkeleton columns={7} rows={5} />
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
                    <td className="px-6 py-4">
                      {r.receiptImageUrl ? (
                        <a
                          href={r.receiptImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#001EC5] underline text-xs font-medium"
                        >
                          View Receipt
                        </a>
                      ) : r.receiptUrl ? (
                        <a
                          href={r.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#001EC5] underline text-xs font-medium"
                        >
                          Stripe Receipt
                        </a>
                      ) : (
                        <span className="text-[#9CA3AF] text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <CenteredEmptyState description="No remittances found for the selected filters." />
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
