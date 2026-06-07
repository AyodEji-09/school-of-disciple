import { useEffect, useState } from "react";
import { FormControl, FormLabel, Option, Select, Stack } from "@mui/joy";
import moment from "moment";
import axios from "axios";
import { toast } from "react-toastify";

import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
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
import { useGetRemittancesQuery } from "../../data/rtk/remittance";
import { useGetSessionsQuery } from "../../data/rtk/academic";
import { useGetCentersQuery } from "../../data/rtk/center";
import { openRemittanceReportPrintPreview } from "./report-template";
import { getUserFullName, handleError } from "../../utils";
import { METHOD_STATUS, REMITTANCE_STATUS } from "../../utils/status";

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const RemittancesPage = () => {
  const [page, setPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: centersRes } = useGetCentersQuery({ limit: 100 });

  useEffect(() => {
    if (!initialized) {
      const current = sessions.find((s) => s.isCurrent);
      if (current?.name) {
        setSelectedYear(current.name);
        setInitialized(true);
      }
    }
  }, [sessions, initialized]);

  useEffect(() => {
    setPage(1);
  }, [selectedYear, selectedCenter]);

  const academicYears = sessions.map((s) => s.name);
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
    if (typeof r.coordinatorId === "string") return null;
    return getUserFullName(r.coordinatorId as User) || null;
  };

  const getCenterName = (r: Remittance): string | null => {
    if (typeof r.centerId === "string") return null;
    return (r.centerId as Center)?.name || null;
  };

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

  return (
    <Frame text="Remittances">
      <div className="pb-16 mt-6">
        <PageCard
          title="Coordinator Remittance History"
          subtitle="All historical remittances from center coordinators."
          action={
            <AppButton
              type="button"
              loading={isGeneratingReport}
              disabled={isGeneratingReport}
              onClick={generateRemittanceReport}
            >
              Generate Report
            </AppButton>
          }
          padded={false}
        >
          <div className="px-6 py-4.5">
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
            </Stack>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Coordinator</TableHeaderCell>
                  <TableHeaderCell>Center</TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Receipt</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading && !hasDocs ? (
                  <tr>
                    <td colSpan={7}>
                      <TableSkeleton columns={7} rows={5} />
                    </td>
                  </tr>
                ) : hasDocs ? (
                  docs.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>
                        {moment(r.createdAt).format("MM/DD/YYYY")}
                      </TableCell>
                      <TableCell>
                        {getCoordinatorName(r) ?? <EmptyValue />}
                      </TableCell>
                      <TableCell>
                        {getCenterName(r) ?? <EmptyValue />}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={r.method}
                          map={METHOD_STATUS}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(r.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={r.status}
                          map={REMITTANCE_STATUS}
                        />
                      </TableCell>
                      <TableCell>
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
                          <EmptyValue />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <CenteredEmptyState description="No remittances found for the selected filters." />
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

export default RemittancesPage;
