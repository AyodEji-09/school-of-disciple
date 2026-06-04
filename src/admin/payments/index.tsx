import { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
} from "@mui/joy";
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
import { useGetPaymentsQuery } from "../../data/rtk/payment";
import {
  useGetAllRegistrationWindowsQuery,
  useGetRegistrationWindowQuery,
} from "../../data/rtk/registration";
import { useGetCentersQuery } from "../../data/rtk/center";
import Frame from "../../components/frame/Frame";
import { PAYMENT_STATUS } from "../../utils/status";

type CenterBreakdown = {
  centerName: string;
  transactions: number;
  amount: number;
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

const getCenterNameFromPayment = (payment: Payment): string | null => {
  const student = getStudentFromPayment(payment);
  if (!student || !student.center) return null;
  if (typeof student.center === "string") return null;
  return student.center.name || null;
};

const Payments = () => {
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

  const { data: allWindowsRes } = useGetAllRegistrationWindowsQuery({
    page: 1,
    limit: 100,
  });
  const { data: currentWindowRes } = useGetRegistrationWindowQuery();
  const { data: centersRes } = useGetCentersQuery(
    { limit: 100 },
    { skip: !isAdmin },
  );

  useEffect(() => {
    if (!initialized && currentWindowRes?.data?.label) {
      setSelectedYear(currentWindowRes.data.label);
      setInitialized(true);
    }
  }, [currentWindowRes, initialized]);

  useEffect(() => {
    setPage(1);
  }, [selectedYear, selectedCenter]);

  const academicYears = allWindowsRes?.data?.docs?.map((w) => w.label) ?? [];
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
      ...(selectedYear ? { academicYear: selectedYear } : {}),
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

      const report = {
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
          <div className="px-6 pt-4 pb-2">
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
                  <TableHeaderCell className="text-right">Action</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading && !hasPayments ? (
                  <tr>
                    <td colSpan={isCoordinator ? 6 : 7}>
                      <TableSkeleton
                        columns={isCoordinator ? 6 : 7}
                        rows={6}
                      />
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
                            {getCenterNameFromPayment(payment) ?? <EmptyValue />}
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
                          <AppButton
                            type="button"
                            className="h-8 px-4 text-xs"
                            disabled={!payerId}
                            onClick={() =>
                              navigate(
                                `/dashboard/payments/users/${payerId}`,
                              )
                            }
                          >
                            View
                          </AppButton>
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
