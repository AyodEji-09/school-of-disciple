import { useEffect, useState } from "react";
import {
  Box,
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
import { useGetRemittancesQuery } from "../../data/rtk/remittance";
import {
  useGetAllRegistrationWindowsQuery,
  useGetRegistrationWindowQuery,
} from "../../data/rtk/registration";
import { useGetCentersQuery } from "../../data/rtk/center";
import { openRemittanceReportPrintPreview } from "./report-template";
import { getUserFullName, handleError } from "../../utils";

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

  const { data: allWindowsRes } = useGetAllRegistrationWindowsQuery({
    page: 1,
    limit: 100,
  });
  const { data: currentWindowRes } = useGetRegistrationWindowQuery();
  const { data: centersRes } = useGetCentersQuery({ limit: 100 });

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
      <div className="pb-16">
        <Card variant="outlined" sx={{ p: 0, overflow: "hidden", mt: 4 }}>
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
                              color:
                                r.method === "stripe" ? "#635BFF" : "#6D28D9",
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
      </div>
    </Frame>
  );
};

export default RemittancesPage;
