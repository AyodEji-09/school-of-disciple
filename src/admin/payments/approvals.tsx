import { useState } from "react";
import { Box, Button, Card, Chip, Divider, Stack, Typography } from "@mui/joy";
import moment from "moment";
import { toast } from "react-toastify";

import Frame from "../../components/frame/Frame";
import { handleError } from "../../utils";
import { TableSkeleton } from "../../components/query-state/QueryStates";
import {
  useConfirmTransactionMutation,
  useGetTransactionsQuery,
  useRejectTransactionMutation,
} from "../../data/rtk/transaction";

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
    if (!t.createdBy) return "-";
    const first = t.createdBy.firstName || "";
    const last = t.createdBy.lastName || "";
    return `${first} ${last}`.trim() || t.createdBy.email || "-";
  };

  const getCenterName = (t: any) => {
    return t.center?.name || "-";
  };

  const getTypeLabel = (type: string) => {
    const config: Record<
      string,
      { label: string; color: "primary" | "warning" | "success" }
    > = {
      registration: { label: "Student Registration", color: "primary" },
      remittance: { label: "Coordinator Remittance", color: "warning" },
      manual_order: { label: "Manual Order", color: "success" },
    };
    return config[type] || { label: type, color: "primary" };
  };

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
        <div className="pb-16">
          <div className="bg-white border border-slate-100 rounded-xl p-12 text-center max-w-xl mx-auto shadow-sm my-4 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
              <svg
                className="w-8 h-8 animate-bounce"
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
              sx={{ textColor: "#001F54", fontWeight: 700 }}
            >
              All Caught Up!
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
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
      <div className="pb-16">
        <Card variant="outlined" sx={{ p: 0, overflow: "hidden", mt: 4 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <div>
                <Typography level="title-lg">Pending Approvals</Typography>
                <Typography
                  level="body-sm"
                  sx={{ mt: 0.5, color: "text.tertiary" }}
                >
                  Coordinator and student payments awaiting your confirmation
                </Typography>
              </div>
              {hasDocs && (
                <Chip color="warning" variant="solid" size="lg">
                  {docs.length}
                </Chip>
              )}
            </Stack>
          </Box>
          <Divider />
          <Box className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
              <thead className="text-xs whitespace-nowrap">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Payer
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
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Receipt
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="whitespace-nowrap">
                {isLoading && !hasDocs ? (
                  <tr>
                    <td colSpan={9}>
                      <TableSkeleton columns={9} rows={3} />
                    </td>
                  </tr>
                ) : (
                  docs.map((t: any) => {
                    const typeInfo = getTypeLabel(t.type);
                    return (
                      <tr
                        className="border-b last:border-none font-medium"
                        key={t._id}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {moment(t.createdAt).format("MM/DD/YYYY")}
                        </td>
                        <td className="px-6 py-4">
                          <Chip
                            color={typeInfo.color}
                            variant="soft"
                            size="sm"
                          >
                            {typeInfo.label}
                          </Chip>
                        </td>
                        <td className="px-6 py-4">{getPayerName(t)}</td>
                        <td className="px-6 py-4">{getCenterName(t)}</td>
                        <td className="px-6 py-4">
                          <Chip
                            variant="outlined"
                            size="sm"
                            sx={{
                              borderColor:
                                t.method === "stripe" ? "#635BFF" : "#6D28D9",
                              color:
                                t.method === "stripe" ? "#635BFF" : "#6D28D9",
                            }}
                          >
                            {t.method === "stripe" ? "Stripe" : "Zelle"}
                          </Chip>
                        </td>
                        <td className="px-6 py-4">{formatCurrency(t.amount)}</td>
                        <td className="px-6 py-4">{t.description || "-"}</td>
                        <td className="px-6 py-4">
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
                            <span className="text-[#9CA3AF] text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Stack direction="row" gap={1}>
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
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>
        </Card>
      </div>
    </Frame>
  );
};

export default PendingApprovalsPage;
