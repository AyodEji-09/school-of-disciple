import { useEffect, useMemo, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  RiArrowLeftLine,
  RiBankCardLine,
  RiCheckLine,
  RiEyeLine,
  RiShieldCheckLine,
} from "react-icons/ri";

import Frame from "../../components/frame/Frame";
import AppModal from "../../components/modal/modal";
import AppPagination from "../../components/pagination/Pagination";
import {
  CenteredEmptyState,
  MetricCardSkeleton,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import { useGetManualOrdersQuery } from "../../data/rtk/manual-order";
import { useGetCentersQuery } from "../../data/rtk/center";
import { getUserFullName } from "../../utils";

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

  // Centers for filter (admin sees all)
  const { data: centersRes } = useGetCentersQuery({ page: 1, limit: 100 });
  const centers = centersRes?.data?.docs ?? [];

  // Reset page when filters change
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

  const orders = useMemo(
    () => ordersRes?.data?.docs ?? [],
    [ordersRes]
  );
  const hasOrders = orders.length > 0;
  const totalPages = ordersRes?.data?.totalPages || 1;

  // Summary metrics (compute from current page list — backend has no /summary endpoint yet)
  const metrics = useMemo(() => {
    const paid = orders.filter(
      (o) => o.status === "paid" || o.status === "completed"
    );
    const pending = orders.filter(
      (o) => o.status === "pending_payment" || o.status === "pending_confirmation"
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
      <div className="pb-16">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mt={3}
          mb={3}
        >
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
        </Stack>

        {/* Summary Cards */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          mb={3}
          flexWrap="wrap"
        >
          {isLoading && !hasOrders ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </Stack>

        {/* Filters */}
        <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
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
        </Card>

        {/* Table */}
        <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
          <Box className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
              <thead className="text-xs whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Coordinator</th>
                  <th className="px-4 py-3">Center</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Receipt</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="whitespace-nowrap">
                {isLoading && !hasOrders ? (
                  <tr>
                    <td colSpan={9}>
                      <TableSkeleton columns={9} rows={6} />
                    </td>
                  </tr>
                ) : hasOrders ? (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b last:border-none font-medium"
                    >
                      <td className="px-4 py-3">
                        {order.createdAt
                          ? moment(order.createdAt).format("MM/DD/YYYY")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <CoordinatorCell order={order} />
                      </td>
                      <td className="px-4 py-3">{order.centerName}</td>
                      <td className="px-4 py-3 text-center">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <MethodChip method={order.paymentMethod} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={order.status} />
                      </td>
                      <td className="px-4 py-3">
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
                          <span className="text-[#9CA3AF] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setDetailsOrder(order)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#001EC5] hover:underline"
                        >
                          <RiEyeLine size={14} />
                          Details
                        </button>
                      </td>
                    </tr>
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
              </tbody>
            </table>
          </Box>
          {totalPages > 1 && (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </Box>
          )}
          {(isFetching || isLoading) && hasOrders && (
            <Typography
              level="body-xs"
              sx={{ textAlign: "center", pb: 2, color: "text.tertiary" }}
            >
              Updating…
            </Typography>
          )}
        </Card>
      </div>

      {/* Order Details Modal */}
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
            <Divider />
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
            <Divider />
            <Stack direction="row" gap={4} flexWrap="wrap">
              <DetailRow label="Center" value={detailsOrder.centerName} />
              <DetailRow
                label="Zonal/Regional Coordinator"
                value={detailsOrder.zonalRegionalCoordinatorName}
              />
            </Stack>
            <Divider />
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
            <Divider />
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
            <Divider />
            <Stack direction="row" gap={2} flexWrap="wrap">
              <MethodChip method={detailsOrder.paymentMethod} />
              <StatusChip status={detailsOrder.status} />
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

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="hidden"
        aria-hidden
      >
        <RiArrowLeftLine />
      </button>
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
    success: "text-[#047857]",
    warning: "text-[#B45309]",
    danger: "text-[#B91C1C]",
  };
  const labelClasses: Record<SummaryTone, string> = {
    default: "text-[#475569]",
    primary: "text-white/80",
    success: "text-[#065F46]",
    warning: "text-[#92400E]",
    danger: "text-[#991B1B]",
  };

  return (
    <Card
      variant="outlined"
      className={`flex-1 min-w-[180px] p-4 border ${toneClasses[tone]}`}
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
    </Card>
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

const MethodChip = ({ method }: { method: ManualOrder["paymentMethod"] }) => {
  if (method === "stripe") {
    return (
      <Chip
        size="sm"
        variant="outlined"
        sx={{ borderColor: "#635BFF", color: "#635BFF" }}
      >
        <span className="inline-flex items-center gap-1">
          <RiBankCardLine size={12} />
          Stripe
        </span>
      </Chip>
    );
  }
  return (
    <Chip
      size="sm"
      variant="outlined"
      sx={{ borderColor: "#6D28D9", color: "#6D28D9" }}
    >
      <span className="inline-flex items-center gap-1">
        <RiShieldCheckLine size={12} />
        Zelle
      </span>
    </Chip>
  );
};

const StatusChip = ({ status }: { status: ManualOrder["status"] }) => {
  const config: Record<
    ManualOrder["status"],
    { color: "success" | "warning" | "danger" | "neutral" | "primary"; label: string }
  > = {
    pending_payment: { color: "warning", label: "Pending Payment" },
    pending_confirmation: {
      color: "neutral",
      label: "Pending Confirmation",
    },
    paid: { color: "success", label: "Paid" },
    rejected: { color: "danger", label: "Rejected" },
    processing: { color: "primary", label: "Processing" },
    completed: { color: "success", label: "Completed" },
  };
  const c = config[status] ?? { color: "warning" as const, label: status };
  return (
    <Chip size="sm" color={c.color} variant="soft">
      {c.label}
    </Chip>
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
