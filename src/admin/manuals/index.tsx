import { useRef, useState } from "react";
import { Stack, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RiAddLine, RiCheckLine, RiUploadCloud2Line } from "react-icons/ri";

import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import AppPagination from "../../components/pagination/Pagination";
import { handleError } from "../../utils";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import {
  useGetManualOrdersQuery,
  useUploadManualOrderReceiptMutation,
} from "../../data/rtk/manual-order";
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
      <div className="pb-16 space-y-6 mt-6">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
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

        <PageCard
          padded={false}
          title="Manual Order History"
          subtitle="Your recent manual book orders and their payment status."
        >
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Center</TableHeaderCell>
                  <TableHeaderCell>Qty</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Receipt</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading && !hasOrders ? (
                  <tr>
                    <td colSpan={7}>
                      <TableSkeleton columns={7} rows={5} />
                    </td>
                  </tr>
                ) : hasOrders ? (
                  orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{order.centerName}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
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
                        <ReceiptCell
                          order={order}
                          onUpload={handleReceiptUpload}
                          uploading={
                            uploadingReceipt || uploadingId === order._id
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <CenteredEmptyState description="No manual orders yet. Click 'Order New Manuals' to get started." />
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

export default ManualOrdersPage;

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

  return <EmptyValue />;
};
