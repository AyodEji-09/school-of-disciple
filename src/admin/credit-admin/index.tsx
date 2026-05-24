import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import Frame from "../../components/frame/Frame";
import AppModal from "../../components/modal/modal";
import AppButton from "../../components/Button/AppButton";
import { handleError } from "../../utils";
import {
  useGetRemittancesQuery,
  useCreateStripeRemittanceMutation,
  useCreateZelleRemittanceMutation,
  useGetZelleDetailsQuery,
  useUploadRemittanceReceiptMutation,
} from "../../data/rtk/remittance";
import {
  CenteredEmptyState,
  TableSkeleton,
  MetricCardSkeleton,
} from "../../components/query-state/QueryStates";
import moment from "moment";

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CreditAdminPage = () => {
  const [searchParams] = useSearchParams();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");

  const { data: remittances, isLoading } = useGetRemittancesQuery({
    limit: 50,
  });
  const { data: zelleDetailsRes } = useGetZelleDetailsQuery(undefined, {
    // Skip if the modal isn't open to avoid unnecessary requests
    refetchOnFocus: false,
  });

  const [createStripeRemittance, { isLoading: stripeLoading }] =
    useCreateStripeRemittanceMutation();
  const [createZelleRemittance, { isLoading: zelleLoading }] =
    useCreateZelleRemittanceMutation();

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadReceipt, { isLoading: uploadingReceipt }] =
    useUploadRemittanceReceiptMutation();

  const [zelleDetails, setZelleDetails] = useState<{
    email: string;
    name: string;
  } | null>(null);

  // Handle Stripe redirect success/failure
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      toast.success(
        "Payment successful! Your remittance will be confirmed shortly.",
      );
    } else if (success === "false") {
      toast.error("Payment was cancelled.");
    }
  }, [searchParams]);

  const docs = remittances?.data?.docs || [];

  const totalRemitted = docs
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingCount = docs.filter(
    (r) => r.status === "pending_confirmation",
  ).length;
  const pendingAmount = docs
    .filter((r) => r.status === "pending_confirmation")
    .reduce((sum, r) => sum + r.amount, 0);

  const amountCents = Math.round(Number(amount) * 100);

  const handleStripePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description for this remittance");
      return;
    }

    try {
      const res = await createStripeRemittance({
        amount: amountCents,
        description: description.trim(),
      }).unwrap();

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const openZelleModal = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if details are fetched
    if (!zelleDetailsRes?.data?.email || !zelleDetailsRes?.data?.name) {
      toast.error("Admin has not configured Zelle payment details yet.");
      return;
    }

    // Open child modal on top
    setIsZelleModalOpen(true);
  };

  const submitZellePayment = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description for this remittance");
      return;
    }

    try {
      const result = await createZelleRemittance({
        amount: amountCents,
        description: description.trim(),
      }).unwrap();

      // Upload receipt if coordinator attached one
      const remittanceId = (result as any)?.data?.remittance?._id;
      if (receiptFile && remittanceId) {
        try {
          await uploadReceipt({ id: remittanceId, file: receiptFile }).unwrap();
        } catch (uploadErr) {
          // Non-fatal — remittance was created; just warn
          toast.warn(
            "Remittance submitted but receipt upload failed. You can upload it from your history.",
          );
        }
      }

      toast.success("Zelle remittance submitted. Awaiting admin confirmation.");
      closeZelleModal();
      closePayModal();
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const closePayModal = () => {
    setIsPayModalOpen(false);
    setAmount("");
    setDescription("");
    setReceiptFile(null);
  };

  const closeZelleModal = () => {
    setIsZelleModalOpen(false);
    setZelleDetails(null);
    setAmount("");
    setDescription("");
    setReceiptFile(null);
  };

  return (
    <Frame text="Credit Admin">
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, pb: 10 }}>
        <Stack spacing={3}>
          {/* Summary Cards */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {isLoading ? (
              <>
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
                    Total Remitted
                  </Typography>
                  <Typography
                    level="h2"
                    sx={{ color: "white", mt: 0.5, fontWeight: 700 }}
                  >
                    {formatCurrency(totalRemitted)}
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
                    {formatCurrency(pendingAmount)}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    {pendingCount} transaction{pendingCount !== 1 ? "s" : ""}{" "}
                    awaiting confirmation
                  </Typography>
                </Card>
                <Card sx={{ flex: 1, p: 3 }}>
                  <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                    Total Transactions
                  </Typography>
                  <Typography
                    level="h2"
                    sx={{ mt: 0.5, fontWeight: 700, color: "#001F54" }}
                  >
                    {docs.length}
                  </Typography>
                </Card>
              </>
            )}
          </Stack>

          {/* Action Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <AppButton type="button" onClick={() => setIsPayModalOpen(true)}>
              Credit Admin
            </AppButton>
          </Box>

          {/* Remittance History */}
          <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography level="title-lg">Remittance History</Typography>
              <Typography
                level="body-sm"
                sx={{ mt: 0.5, color: "text.tertiary" }}
              >
                All your payments to the admin
              </Typography>
            </Box>
            <Divider />
            <RemittanceTable docs={docs} isLoading={isLoading} />
          </Card>
        </Stack>

        {/* Payment Method Modal */}
        <AppModal
          isOpen={isPayModalOpen}
          close={closePayModal}
          title="Credit Admin"
          icon
        >
          <div className="w-[min(480px,85vw)] mt-2 max-h-[75vh] overflow-y-auto pr-1">
            <Typography level="body-sm" sx={{ color: "text.tertiary", mb: 3 }}>
              Enter the amount you'd like to remit and choose a payment method.
            </Typography>

            <Stack spacing={2.5}>
              <FormControl>
                <FormLabel>Amount (USD)</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 250.00"
                  startDecorator="$"
                  slotProps={{ input: { min: 0, step: "0.01" } }}
                  sx={{ fontSize: "lg" }}
                />
                {amount && Number(amount) > 0 && (
                  <Typography
                    level="body-xs"
                    sx={{ mt: 0.5, color: "text.secondary" }}
                  >
                    You are remitting{" "}
                    <strong>{formatCurrency(amountCents)}</strong>
                  </Typography>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. School fees for May 2026"
                  required
                  minRows={2}
                />
              </FormControl>

              <Divider sx={{ my: 1 }}>Choose Payment Method</Divider>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  fullWidth
                  onClick={handleStripePayment}
                  loading={stripeLoading}
                  disabled={!amount || Number(amount) <= 0}
                  sx={{
                    py: 2,
                    background:
                      "linear-gradient(135deg, #635BFF 0%, #7C3AED 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5046e4 0%, #6D28D9 100%)",
                    },
                    fontWeight: 600,
                    fontSize: "md",
                  }}
                >
                  💳 Pay with Stripe
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={openZelleModal}
                  loading={zelleLoading}
                  disabled={!amount || Number(amount) <= 0}
                  sx={{
                    py: 2,
                    borderColor: "#6D28D9",
                    color: "#6D28D9",
                    "&:hover": {
                      background: "rgba(109, 40, 217, 0.06)",
                      borderColor: "#5B21B6",
                    },
                    fontWeight: 600,
                    fontSize: "md",
                  }}
                >
                  🏦 Pay with Zelle
                </Button>
              </Stack>
            </Stack>
          </div>
        </AppModal>

        {/* Zelle Details Modal */}
        <AppModal
          isOpen={isZelleModalOpen}
          close={closeZelleModal}
          title="Zelle Payment Details"
          icon
        >
          <div className="w-[min(440px,85vw)] mt-2">
            <Card
              variant="soft"
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #F0F4FF 0%, #E8E0FF 100%)",
                border: "1px solid #D4CAFE",
              }}
            >
              <Typography
                level="body-sm"
                sx={{ color: "text.tertiary", mb: 2 }}
              >
                Send the payment to the admin using Zelle with the details
                below:
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "text.tertiary",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Recipient Name
                  </Typography>
                  <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                    {zelleDetails?.name || zelleDetailsRes?.data?.name || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "text.tertiary",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Zelle Email
                  </Typography>
                  <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                    {zelleDetails?.email || zelleDetailsRes?.data?.email || "—"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "text.tertiary",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Amount to Send
                  </Typography>
                  <Typography
                    level="h3"
                    sx={{ fontWeight: 700, color: "#001EC5" }}
                  >
                    {formatCurrency(amountCents)}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: "md",
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
              }}
            >
              <Typography level="body-sm" sx={{ color: "#92400E" }}>
                ⚠️ After sending the payment via Zelle, the admin will confirm
                receipt from their end. Your remittance will show as{" "}
                <strong>"Pending Confirmation"</strong> until then.
              </Typography>
            </Box>

            {/* Optional proof of payment */}
            <Box sx={{ mt: 2 }}>
              <Typography
                level="body-sm"
                sx={{ fontWeight: 600, mb: 1, color: "#001F54" }}
              >
                Proof of Payment (optional)
              </Typography>
              <Typography
                level="body-xs"
                sx={{ color: "text.tertiary", mb: 1.5 }}
              >
                Attach a screenshot or PDF of your Zelle payment confirmation.
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  display: "block",
                  border: "2px dashed",
                  borderColor: receiptFile ? "#001EC5" : "#D1D5DB",
                  borderRadius: "md",
                  p: 2,
                  textAlign: "center",
                  background: receiptFile ? "#F0F4FF" : "#FAFAFA",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                component="label"
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                {receiptFile ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                  >
                    <Typography
                      level="body-sm"
                      sx={{ color: "#001EC5", fontWeight: 600 }}
                    >
                      ✓ {receiptFile.name}
                    </Typography>
                    <Button
                      size="sm"
                      variant="plain"
                      color="neutral"
                      onClick={(e) => {
                        e.preventDefault();
                        setReceiptFile(null);
                      }}
                      sx={{ minHeight: 0, p: 0.5 }}
                    >
                      Remove
                    </Button>
                  </Stack>
                ) : (
                  <Typography level="body-sm" sx={{ color: "#6B7280" }}>
                    Click to attach receipt
                  </Typography>
                )}
              </Box>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={2}
              mt={3}
              justifyContent="flex-end"
            >
              <Button variant="outlined" onClick={closeZelleModal}>
                Cancel
              </Button>
              <Button
                onClick={submitZellePayment}
                loading={zelleLoading || uploadingReceipt}
                disabled={zelleLoading || uploadingReceipt}
                sx={{
                  background: "#6D28D9",
                  "&:hover": { background: "#5B21B6" },
                }}
              >
                I have sent the payment
              </Button>
            </Stack>
          </div>
        </AppModal>
      </Box>
    </Frame>
  );
};

export default CreditAdminPage;

/* ────── Remittance History Table ────── */

const getStatusChip = (status: Remittance["status"]) => {
  const config: Record<
    Remittance["status"],
    { color: "success" | "warning" | "danger"; label: string }
  > = {
    paid: { color: "success", label: "Confirmed" },
    pending_confirmation: { color: "warning", label: "Pending" },
    rejected: { color: "danger", label: "Rejected" },
  };
  const c = config[status] || { color: "warning" as const, label: status };
  return (
    <Chip color={c.color} variant="soft" size="sm">
      {c.label}
    </Chip>
  );
};

const getMethodChip = (method: Remittance["method"]) => {
  return (
    <Chip
      variant="outlined"
      size="sm"
      sx={{
        borderColor: method === "stripe" ? "#635BFF" : "#6D28D9",
        color: method === "stripe" ? "#635BFF" : "#6D28D9",
      }}
    >
      {method === "stripe" ? "Stripe" : "Zelle"}
    </Chip>
  );
};

const RemittanceTable = ({
  docs,
  isLoading,
}: {
  docs: Remittance[];
  isLoading: boolean;
}) => {
  return (
    <Box className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
        <thead className="text-xs whitespace-nowrap">
          <tr>
            <th scope="col" className="px-6 py-3">
              Date
            </th>
            <th scope="col" className="px-6 py-3">
              Description
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
          {isLoading && docs.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <TableSkeleton columns={6} rows={5} />
              </td>
            </tr>
          ) : docs.length ? (
            docs.map((r) => (
              <tr className="border-b last:border-none font-medium" key={r._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {moment(r.createdAt).format("MM/DD/YYYY")}
                </td>
                <td className="px-6 py-4">
                  {r.description || "School fees remittance"}
                </td>
                <td className="px-6 py-4">{getMethodChip(r.method)}</td>
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
                      View
                    </a>
                  ) : r.receiptUrl ? (
                    <a
                      href={r.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#001EC5] underline text-xs font-medium"
                    >
                      Stripe
                    </a>
                  ) : (
                    <span className="text-[#9CA3AF] text-xs">—</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <CenteredEmptyState description="No remittances yet. Click 'Credit Admin' to get started." />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  );
};
