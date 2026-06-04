import { useState } from "react";
import { Button, Chip, Stack, Typography } from "@mui/joy";
import moment from "moment";
import { toast } from "react-toastify";

import Frame from "../../components/frame/Frame";
import { handleError } from "../../utils";
import { TableSkeleton } from "../../components/query-state/QueryStates";
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
import {
  useConfirmTransactionMutation,
  useGetTransactionsQuery,
  useRejectTransactionMutation,
} from "../../data/rtk/transaction";
import { METHOD_STATUS, TX_TYPE_STATUS } from "../../utils/status";

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const PendingApprovalsPage = () => {
  const { data: transactionsRes, isLoading } = useGetTransactionsQuery({
    limit: 100,
    status: "pending",
  });
  const [confirmTransaction] = useConfirmTransactionMutation();
  const [rejectTransaction] = useRejectTransactionMutation();
  const [actionId, setActionId] = useState<string | null>(null);

  const docs = transactionsRes?.data?.docs || [];
  const hasDocs = docs.length > 0;

  const getPayerName = (t: any) => {
    if (!t.createdBy) return null;
    const first = t.createdBy.firstName || "";
    const last = t.createdBy.lastName || "";
    return (
      `${first} ${last}`.trim() || t.createdBy.email || null
    );
  };

  const getCenterName = (t: any) => t.center?.name || null;

  const handleConfirm = async (id: string) => {
    if (!window.confirm("Confirm this transaction as received?")) return;
    setActionId(id);
    try {
      await confirmTransaction(id).unwrap();
      toast.success("Transaction confirmed successfully");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return;
    setActionId(id);
    try {
      await rejectTransaction({ id, reason: reason || undefined }).unwrap();
      toast.success("Transaction rejected");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setActionId(null);
    }
  };

  if (!isLoading && !hasDocs) {
    return (
      <Frame text="Approvals">
        <div className="pb-16 mt-6">
          <div className="bg-white border border-[#E6ECFF] rounded-2xl shadow-sm p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-[#D1FAE5] text-[#15803D] rounded-full">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <Typography
              level="title-lg"
              sx={{ color: "#001F54", fontWeight: 700 }}
            >
              All Caught Up!
            </Typography>
            <Typography level="body-sm" sx={{ color: "#6B7280" }}>
              There are no pending transactions requiring your confirmation at
              the moment.
            </Typography>
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame text="Approvals">
      <div className="pb-16 mt-6">
        <PageCard
          title="Pending Approvals"
          subtitle="Coordinator and student payments awaiting your confirmation"
          action={
            hasDocs ? (
              <Chip color="warning" variant="solid" size="md">
                {docs.length} pending
              </Chip>
            ) : null
          }
          padded={false}
        >
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Payer</TableHeaderCell>
                  <TableHeaderCell>Center</TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Receipt</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading && !hasDocs ? (
                  <tr>
                    <td colSpan={9}>
                      <TableSkeleton columns={9} rows={3} />
                    </td>
                  </tr>
                ) : (
                  docs.map((t: any) => (
                    <TableRow key={t._id}>
                      <TableCell>
                        {moment(t.createdAt).format("MM/DD/YYYY")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={t.type}
                          map={TX_TYPE_STATUS}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>
                        {getPayerName(t) ?? <EmptyValue />}
                      </TableCell>
                      <TableCell>
                        {getCenterName(t) ?? <EmptyValue />}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={t.method}
                          map={METHOD_STATUS}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(t.amount)}</TableCell>
                      <TableCell>
                        {t.description || <EmptyValue />}
                      </TableCell>
                      <TableCell>
                        {t.zelleReceiptUrl ? (
                          <a
                            href={t.zelleReceiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#001EC5] underline text-xs font-medium"
                          >
                            View Receipt
                          </a>
                        ) : (
                          <EmptyValue />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Stack
                          direction="row"
                          gap={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="sm"
                            color="success"
                            variant="solid"
                            disabled={actionId === t._id}
                            onClick={() => handleConfirm(t._id)}
                            sx={{ fontWeight: 600 }}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="outlined"
                            disabled={actionId === t._id}
                            onClick={() => handleReject(t._id)}
                            sx={{ fontWeight: 600 }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </table>
          </div>
        </PageCard>
      </div>
    </Frame>
  );
};

export default PendingApprovalsPage;
