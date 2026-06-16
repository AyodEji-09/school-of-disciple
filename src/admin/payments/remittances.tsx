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
import { useURL } from "../../data/config";
import { getUserFullName, handleError } from "../../utils";
import { METHOD_STATUS, REMITTANCE_STATUS } from "../../utils/status";

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const RemittancesPage = () => {
  const [page, setPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: centersRes } = useGetCentersQuery({ limit: 100 });

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

  const { data: remittances, isLoading } = useGetRemittancesQuery({
    page,
    limit: 10,
    ...(selectedSessionId ? { sessionId: selectedSessionId } : {}),
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
      const params = new URLSearchParams();
      if (selectedSessionId) params.set("sessionId", selectedSessionId);
      if (selectedCenter) params.set("center", selectedCenter);

      const res = await axios.get<Blob>(
        `${useURL}/financial/reports/remittances/pdf?${params.toString()}`,
        { responseType: "blob" },
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const selectedSessionName = sessions.find((s) => s._id === selectedSessionId)?.name;
      link.setAttribute("download", `RemittanceReport-${selectedSessionName || "All"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Remittance report downloaded.");
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
