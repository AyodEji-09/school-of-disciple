import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { RiCheckLine, RiEyeLine } from "react-icons/ri";

import Frame from "../../components/frame/Frame";
import AppModal from "../../components/modal/modal";
import AppPagination from "../../components/pagination/Pagination";
import {
  CenteredEmptyState,
  MetricCardRow,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import { useGetManualOrdersQuery } from "../../data/rtk/manual-order";
import { useGetCentersQuery } from "../../data/rtk/center";
import { getUserFullName } from "../../utils";
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
import {
  MANUAL_ORDER_STATUS,
  METHOD_STATUS,
} from "../../utils/status";

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "pending_confirmation", label: "Pending Confirmation" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
];

const PAYMENT_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All methods" },
  { value: "stripe", label: "Credit Card" },
  { value: "zelle", label: "Zelle" },
];

const ManualOrdersAdminPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [center, setCenter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailsOrder, setDetailsOrder] = useState<ManualOrder | null>(null);

  const { data: centersRes } = useGetCentersQuery({ page: 1, limit: 100 });
  const centers = centersRes?.data?.docs ?? [];

  useEffect(() => {
    setPage(1);
  }, [status, paymentMethod, center, dateFrom, dateTo]);

  const { data: ordersRes, isLoading, isFetching } = useGetManualOrdersQuery({
    page,
    limit: 10,
    ...(status ? { status } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(center ? { center } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });

  const orders = useMemo(() => ordersRes?.data?.docs ?? [], [ordersRes]);
  const hasOrders = orders.length > 0;
  const totalPages = ordersRes?.data?.totalPages || 1;

  const metrics = useMemo(() => {
    const paid = orders.filter(
      (o) => o.status === "paid" || o.status === "completed",
    );
    const pending = orders.filter(
      (o) =>
        o.status === "pending_payment" || o.status === "pending_confirmation",
    );
    const rejected = orders.filter((o) => o.status === "rejected");
    const totalRevenue = paid.reduce((sum, o) => sum + (o.amount || 0), 0);
    return {
      total: orders.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      totalRevenue,
    };
  }, [orders]);

  const clearFilters = () => {
    setStatus("");
    setPaymentMethod("");
    setCenter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    Boolean(status) ||
    Boolean(paymentMethod) ||
    Boolean(center) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <Frame text="Manual Orders">
      <div className="pb-16 mt-6 space-y-6">
        <Typography level="body-sm" textColor="neutral.500">
          Track every manual order placed by coordinators. Confirm or reject
          pending Zelle orders from{" "}
          <button
            type="button"
            onClick={() => navigate("/dashboard/payments")}
            className="text-[#001EC5] hover:underline font-medium"
          >
            Payments → Pending Approvals
          </button>
          .
        </Typography>

        {isLoading && !hasOrders ? (
          <MetricCardRow count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Orders" value={String(metrics.total)} />
            <SummaryCard
              label="Confirmed"
              value={String(metrics.paidCount)}
              tone="success"
            />
            <SummaryCard
              label="Pending"
              value={String(metrics.pendingCount)}
              tone="warning"
            />
            <SummaryCard
              label="Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              tone="primary"
            />
          </div>
        )}

        <PageCard padded={false}>
          <div className="px-6 pt-6 pb-2">
            <Stack direction="row" gap={2} flexWrap="wrap" alignItems="flex-end">
              <FormControl size="sm" sx={{ minWidth: 180 }}>
                <FormLabel>Status</FormLabel>
                <Select
                  size="sm"
                  value={status}
                  onChange={(_, val) => setStatus((val as string) ?? "")}
                  placeholder="All statuses"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="sm" sx={{ minWidth: 160 }}>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  size="sm"
                  value={paymentMethod}
                  onChange={(_, val) => setPaymentMethod((val as string) ?? "")}
                  placeholder="All methods"
                >
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="sm" sx={{ minWidth: 200 }}>
                <FormLabel>Center</FormLabel>
                <Select
                  size="sm"
                  value={center}
                  onChange={(_, val) => setCenter((val as string) ?? "")}
                  placeholder="All centers"
                >
                  <Option value="">All centers</Option>
                  {centers.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="sm" sx={{ minWidth: 160 }}>
                <FormLabel>From</FormLabel>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 px-2 rounded border border-[#D1D5DB] text-sm text-[#001F54] focus:outline-none focus:border-[#001EC5]"
                />
              </FormControl>

              <FormControl size="sm" sx={{ minWidth: 160 }}>
                <FormLabel>To</FormLabel>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 px-2 rounded border border-[#D1D5DB] text-sm text-[#001F54] focus:outline-none focus:border-[#001EC5]"
                />
              </FormControl>

              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={clearFilters}
                  sx={{ alignSelf: "flex-end" }}
                >
                  Clear filters
                </Button>
              )}
            </Stack>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Coordinator</TableHeaderCell>
                  <TableHeaderCell>Center</TableHeaderCell>
                  <TableHeaderCell className="text-center">Qty</TableHeaderCell>
                  <TableHeaderCell className="text-right">Amount</TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Receipt</TableHeaderCell>
                  <TableHeaderCell className="text-right">Action</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading && !hasOrders ? (
                  <tr>
                    <td colSpan={9}>
                      <TableSkeleton columns={9} rows={6} />
                    </td>
                  </tr>
                ) : hasOrders ? (
                  orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        {order.createdAt
                          ? moment(order.createdAt).format("MM/DD/YYYY")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <CoordinatorCell order={order} />
                      </TableCell>
                      <TableCell>{order.centerName}</TableCell>
                      <TableCell className="text-center">
                        {order.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={order.paymentMethod}
                          map={METHOD_STATUS}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={order.status}
                          map={MANUAL_ORDER_STATUS}
                        />
                      </TableCell>
                      <TableCell>
                        {order.receiptUrl ? (
                          <a
                            href={order.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#001EC5] hover:underline"
                          >
                            <RiCheckLine size={14} />
                            View
                          </a>
                        ) : (
                          <EmptyValue />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => setDetailsOrder(order)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#001EC5] hover:underline"
                        >
                          <RiEyeLine size={14} />
                          Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <CenteredEmptyState
                        description={
                          hasActiveFilters
                            ? "No manual orders match the selected filters."
                            : "No manual orders yet."
                        }
                      />
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
          {(isFetching || isLoading) && hasOrders && (
            <Typography
              level="body-xs"
              sx={{ textAlign: "center", pb: 2, color: "text.tertiary" }}
            >
              Updating…
            </Typography>
          )}
        </PageCard>
      </div>

      <AppModal
        isOpen={Boolean(detailsOrder)}
        close={() => setDetailsOrder(null)}
        title="Manual Order Details"
        icon
      >
        {detailsOrder && (
          <div className="w-[min(480px,90vw)] mt-2 max-h-[75vh] overflow-y-auto pr-1 space-y-4">
            <DetailRow
              label="Order ID"
              value={
                <span className="font-mono text-xs">{detailsOrder._id}</span>
              }
            />
            <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
            <Stack direction="row" gap={4} flexWrap="wrap">
              <DetailRow
                label="Coordinator"
                value={
                  typeof detailsOrder.coordinatorId === "string"
                    ? detailsOrder.coordinatorName ||
                      detailsOrder.coordinatorEmail
                    : getUserFullName(detailsOrder.coordinatorId as User)
                }
              />
              <DetailRow
                label="Coordinator Email"
                value={detailsOrder.coordinatorEmail}
              />
              <DetailRow label="Phone" value={detailsOrder.phone} />
              <DetailRow label="Zone" value={detailsOrder.zone} />
            </Stack>
            <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
            <Stack direction="row" gap={4} flexWrap="wrap">
              <DetailRow label="Center" value={detailsOrder.centerName} />
              <DetailRow
                label="Zonal/Regional Coordinator"
                value={detailsOrder.zonalRegionalCoordinatorName}
              />
            </Stack>
            <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
            <Stack direction="row" gap={4} flexWrap="wrap">
              <DetailRow label="Quantity" value={String(detailsOrder.quantity)} />
              <DetailRow
                label="Unit Price"
                value={formatCurrency(detailsOrder.unitPrice)}
              />
              <DetailRow
                label="Total"
                value={
                  <strong className="text-[#001EC5]">
                    {formatCurrency(detailsOrder.amount)}
                  </strong>
                }
              />
            </Stack>
            <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
            <DetailRow
              label="Mailing Address"
              value={
                <span className="whitespace-pre-wrap block">
                  {detailsOrder.mailingAddress}
                </span>
              }
            />
            {detailsOrder.concerns && (
              <DetailRow
                label="Concerns"
                value={
                  <span className="whitespace-pre-wrap block">
                    {detailsOrder.concerns}
                  </span>
                }
              />
            )}
            <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
            <Stack direction="row" gap={2} flexWrap="wrap">
              <StatusBadge
                status={detailsOrder.paymentMethod}
                map={METHOD_STATUS}
                size="sm"
              />
              <StatusBadge
                status={detailsOrder.status}
                map={MANUAL_ORDER_STATUS}
              />
            </Stack>
            {detailsOrder.receiptUrl && (
              <DetailRow
                label="Receipt"
                value={
                  <a
                    href={detailsOrder.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#001EC5] hover:underline font-medium"
                  >
                    View Receipt →
                  </a>
                }
              />
            )}
            {detailsOrder.rejectedReason && (
              <DetailRow
                label="Rejection Reason"
                value={
                  <span className="text-[#dc2626]">
                    {detailsOrder.rejectedReason}
                  </span>
                }
              />
            )}
            <DetailRow
              label="Created"
              value={moment(detailsOrder.createdAt).format("MMM D, YYYY h:mm A")}
            />
          </div>
        )}
      </AppModal>
    </Frame>
  );
};

export default ManualOrdersAdminPage;

/* ─── Sub-components ─────────────────────────────────────────────────── */

type SummaryTone = "default" | "primary" | "success" | "warning" | "danger";

const SummaryCard = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: SummaryTone;
}) => {
  const toneClasses: Record<SummaryTone, string> = {
    default: "bg-white",
    primary:
      "bg-gradient-to-br from-[#001F54] to-[#001EC5] text-white border-transparent",
    success: "bg-white border-[#A7F3D0]",
    warning: "bg-white border-[#FDE68A]",
    danger: "bg-white border-[#FECACA]",
  };
  const valueClasses: Record<SummaryTone, string> = {
    default: "text-[#001F54]",
    primary: "text-white",
    success: "text-[#15803D]",
    warning: "text-[#B45309]",
    danger: "text-[#B91C1C]",
  };
  const labelClasses: Record<SummaryTone, string> = {
    default: "text-[#475569]",
    primary: "text-white/80",
    success: "text-[#15803D]",
    warning: "text-[#92400E]",
    danger: "text-[#991B1B]",
  };

  return (
    <div
      className={`flex-1 min-w-[180px] p-4 border border-[#E6ECFF] rounded-2xl shadow-sm ${toneClasses[tone]}`}
    >
      <Typography
        level="body-sm"
        className={labelClasses[tone]}
        sx={{ fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        level="h3"
        className={valueClasses[tone]}
        sx={{ fontWeight: 700, mt: 0.5 }}
      >
        {value}
      </Typography>
    </div>
  );
};

const CoordinatorCell = ({ order }: { order: ManualOrder }) => {
  const name =
    typeof order.coordinatorId === "string"
      ? order.coordinatorName
      : getUserFullName(order.coordinatorId as User);
  return (
    <div>
      <div className="text-[#001F54] font-medium">{name || "-"}</div>
      <div className="text-[#94A3B8] text-xs">{order.coordinatorEmail}</div>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <Typography
      level="body-xs"
      sx={{
        color: "text.tertiary",
        textTransform: "uppercase",
        letterSpacing: 1,
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography level="body-sm" sx={{ color: "#001F54", fontWeight: 500 }}>
      {value || "—"}
    </Typography>
  </div>
);
