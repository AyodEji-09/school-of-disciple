import { useRef, useState } from "react";
import {
  Box,
  Card,
  Chip,
  Stack,
  Typography,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RiAddLine, RiCheckLine, RiUploadCloud2Line } from "react-icons/ri";

import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import AppPagination from "../components/pagination/Pagination";
import { handleError } from "../utils";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../components/query-state/QueryStates";
import {
  useGetManualOrdersQuery,
  useUploadManualOrderReceiptMutation,
} from "../data/rtk/manual-order";

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ManualOrdersPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { data: manualOrdersRes, isLoading } = useGetManualOrdersQuery({
    limit: 10,
    page,
  });
  const [uploadReceipt, { isLoading: uploadingReceipt }] =
    useUploadManualOrderReceiptMutation();

  const orders = manualOrdersRes?.data?.docs || [];
  const hasOrders = orders.length > 0;
  const totalPages = manualOrdersRes?.data?.totalPages || 1;

  const handleReceiptUpload = async (orderId: string, file: File) => {
    setUploadingId(orderId);
    try {
      await uploadReceipt({ id: orderId, file }).unwrap();
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <Frame text="Manuals">
      <div className="pb-16">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
          mt={3}
          mb={4}
        >
          <Typography level="body-sm" textColor="neutral.500">
            Track your manual book orders and place new ones for your centre.
          </Typography>
          <AppButton onClick={() => navigate("/dashboard/manual-order/new")}>
            <span className="inline-flex items-center gap-2">
              <RiAddLine size={18} />
              Order New Manuals
            </span>
          </AppButton>
        </Stack>

        <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography level="title-lg">Manual Order History</Typography>
            <Typography
              level="body-sm"
              sx={{ mt: 0.5, color: "text.tertiary" }}
            >
              Your recent manual book orders and their payment status.
            </Typography>
          </Box>
          <Box className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
              <thead className="text-xs whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Center</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody className="whitespace-nowrap">
                {isLoading && !hasOrders ? (
                  <tr>
                    <td colSpan={7}>
                      <TableSkeleton columns={7} rows={5} />
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
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">{order.centerName}</td>
                      <td className="px-4 py-3">{order.quantity}</td>
                      <td className="px-4 py-3">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {order.paymentMethod === "stripe"
                          ? "Credit Card"
                          : "Zelle"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ReceiptCell
                          order={order}
                          onUpload={handleReceiptUpload}
                          uploading={
                            uploadingReceipt || uploadingId === order._id
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <CenteredEmptyState description="No manual orders yet. Click 'Order New Manuals' to get started." />
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
        </Card>
      </div>
    </Frame>
  );
};

export default ManualOrdersPage;

/* ─── Sub-components ─────────────────────────────────────────────────── */

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

const ReceiptCell = ({
  order,
  onUpload,
  uploading,
}: {
  order: ManualOrder;
  onUpload: (orderId: string, file: File) => void;
  uploading: boolean;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  if (order.receiptUrl) {
    return (
      <a
        href={order.receiptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-[#001EC5] hover:underline"
      >
        <RiCheckLine size={14} />
        View
      </a>
    );
  }

  if (
    order.paymentMethod === "zelle" &&
    order.status === "pending_confirmation"
  ) {
    return (
      <>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(order._id, file);
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#001EC5] hover:underline disabled:opacity-50"
        >
          <RiUploadCloud2Line size={14} />
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </>
    );
  }

  return <span className="text-[#9CA3AF] text-xs">—</span>;
};
