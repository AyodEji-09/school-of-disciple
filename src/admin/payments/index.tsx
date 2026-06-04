import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
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
import { useGetPaymentsQuery } from "../../data/rtk/payment";
import {
  useGetAllRegistrationWindowsQuery,
  useGetRegistrationWindowQuery,
} from "../../data/rtk/registration";
import { useGetCentersQuery } from "../../data/rtk/center";
import Frame from "../../components/frame/Frame";

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

const getCenterNameFromPayment = (payment: Payment) => {
  const student = getStudentFromPayment(payment);
  if (!student || !student.center) return "-";
  if (typeof student.center === "string") return "-";
  return student.center.name || "-";
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
      <div className="pb-16 mt-4">
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
              <Typography
                level="body-sm"
                sx={{ mt: 0.5, color: "text.tertiary" }}
              >
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

              {isAdmin && (
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
              )}
            </Stack>

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
                          <TableSkeleton
                            columns={isCoordinator ? 6 : 7}
                            rows={6}
                          />
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
                                navigate(
                                  `/dashboard/payments/users/${payerId}`,
                                )
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
      </div>
    </Frame>
  );
};

export default Payments;
