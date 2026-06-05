import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
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
  MetricCardSkeleton,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import { useGetManualOrdersQuery } from "../../data/rtk/manual-order";
import { useGetCentersQuery } from "../../data/rtk/center";
import {
  useGetAllRegistrationWindowsQuery,
  useGetRegistrationWindowQuery,
} from "../../data/rtk/registration";
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
import { MANUAL_ORDER_STATUS, METHOD_STATUS } from "../../utils/status";

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
  const [academicYear, setAcademicYear] = useState<string>("");
  const [detailsOrder, setDetailsOrder] = useState<ManualOrder | null>(null);

  const { data: centersRes } = useGetCentersQuery({ page: 1, limit: 100 });
  const centers = centersRes?.data?.docs ?? [];

  const { data: allWindowsRes } = useGetAllRegistrationWindowsQuery({
    page: 1,
    limit: 100,
  });
  const { data: currentWindowRes } = useGetRegistrationWindowQuery();
  const academicYears =
    allWindowsRes?.data?.docs?.map((w) => w.label) ?? [];

  useEffect(() => {
    if (academicYear || !currentWindowRes?.data?.label) return;
    setAcademicYear(currentWindowRes.data.label);
  }, [currentWindowRes, academicYear]);

  useEffect(() => {
    setPage(1);
  }, [status, paymentMethod, center, academicYear]);

  const {
    data: ordersRes,
    isLoading,
    isFetching,
  } = useGetManualOrdersQuery({
    page,
    limit: 10,
    ...(status ? { status } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(center ? { center } : {}),
    ...(academicYear ? { academicYear } : {}),
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
    const inFlight = orders.filter(
      (o) => o.status === "processing" || o.status === "shipped",
    );
    const totalRevenue = paid.reduce((sum, o) => sum + (o.amount || 0), 0);
    return {
      total: orders.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      inFlightCount: inFlight.length,
      totalRevenue,
    };
  }, [orders]);

  const clearFilters = () => {
    setStatus("");
    setPaymentMethod("");
    setCenter("");
    setAcademicYear("");
  };

  const hasActiveFilters =
    Boolean(status) ||
    Boolean(paymentMethod) ||
    Boolean(center) ||
    Boolean(academicYear);

  return (
    <Frame text="Manual Orders">
      <div className="pb-16 mt-6 space-y-6!">
        <Typography level="body-sm" textColor="neutral.500">
          Track every manual order placed by coordinators. Confirm or reject
          pending Zelle orders from{" "}
          <button
            type="button"
            onClick={() => navigate("/dashboard/payments/approvals")}
            className="text-[#001EC5] hover:underline font-medium"
          >
            Payments → Pending Approvals
          </button>
          .
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: "100%" }}
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
              <Card
                sx={{
                  flex: 1,
                  p: 3,
                  background:
                    "linear-gradient(135deg, #001F54 0%, #001EC5 100%)",
                  color: "white",
                }}
              >
                <Typography
                  level="body-sm"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Total Revenue
                </Typography>
                <Typography
                  level="h2"
                  sx={{ color: "white", mt: 0.5, fontWeight: 700 }}
                >
                  {formatCurrency(metrics.totalRevenue)}
                </Typography>
                <Typography
                  level="body-xs"
                  sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}
                >
                  From {metrics.paidCount} confirmed order
                  {metrics.paidCount !== 1 ? "s" : ""}
                </Typography>
              </Card>
              <Card sx={{ flex: 1, p: 3 }}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Total Orders
                </Typography>
                <Typography
                  level="h2"
                  sx={{ mt: 0.5, fontWeight: 700, color: "#001F54" }}
                >
                  {metrics.total}
                </Typography>
                <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                  All time, current view
                </Typography>
              </Card>
              <Card sx={{ flex: 1, p: 3 }}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Pending
                </Typography>
                <Typography
                  level="h2"
                  sx={{ mt: 0.5, fontWeight: 700, color: "#B45309" }}
                >
                  {metrics.pendingCount}
                </Typography>
                <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                  Awaiting payment confirmation
                </Typography>
              </Card>
              <Card sx={{ flex: 1, p: 3 }}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  In Fulfillment
                </Typography>
                <Typography
                  level="h2"
                  sx={{ mt: 0.5, fontWeight: 700, color: "#1D4ED8" }}
                >
                  {metrics.inFlightCount}
                </Typography>
                <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                  Processing or shipped
                </Typography>
              </Card>
            </>
          )}
        </Stack>

        <PageCard padded={false}>
          <div className="px-6 py-5">
            <Stack
              direction="row"
              gap={2}
              flexWrap="wrap"
              alignItems="flex-end"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                gap={2}
                flexWrap="wrap"
                alignItems="flex-end"
              >
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
                    onChange={(_, val) =>
                      setPaymentMethod((val as string) ?? "")
                    }
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

                <FormControl size="sm" sx={{ minWidth: 200 }}>
                  <FormLabel>Academic Session</FormLabel>
                  <Select
                    size="sm"
                    value={academicYear}
                    onChange={(_, val) =>
                      setAcademicYear((val as string) ?? "")
                    }
                    placeholder="All sessions"
                  >
                    <Option value="">All sessions</Option>
                    {academicYears.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

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
        </PageCard>

        <PageCard padded={false}>
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Coordinator</TableHeaderCell>
                  <TableHeaderCell>Center</TableHeaderCell>
                  <TableHeaderCell className="text-center">Qty</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Amount
                  </TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Receipt</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Action
                  </TableHeaderCell>
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
              <DetailRow
                label="Quantity"
                value={String(detailsOrder.quantity)}
              />
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
              value={moment(detailsOrder.createdAt).format(
                "MMM D, YYYY h:mm A",
              )}
            />
          </div>
        )}
      </AppModal>
    </Frame>
  );
};

export default ManualOrdersAdminPage;

/* ─── Sub-components ─────────────────────────────────────────────────── */

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
