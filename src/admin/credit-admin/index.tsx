import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { RiCheckLine, RiUploadCloud2Line } from "react-icons/ri";
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
import { useGetSessionsQuery } from "../../data/rtk/academic";
import {
  CenteredEmptyState,
  TableSkeleton,
  MetricCardSkeleton,
} from "../../components/query-state/QueryStates";
import moment from "moment";
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
import { REMITTANCE_STATUS, METHOD_STATUS } from "../../utils/status";

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
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [remitSessionId, setRemitSessionId] = useState<string>("");

  const { data: sessions = [] } = useGetSessionsQuery();

  useEffect(() => {
    if (remitSessionId) return;
    const current = sessions.find((s) => s.isCurrent);
    if (current?._id) setRemitSessionId(current._id);
  }, [sessions, remitSessionId]);

  useEffect(() => {
    if (selectedSessionId) return;
    const current = sessions.find((s) => s.isCurrent);
    if (current?._id) setSelectedSessionId(current._id);
  }, [sessions, selectedSessionId]);

  const { data: remittances, isLoading } = useGetRemittancesQuery({
    limit: 50,
    ...(selectedSessionId ? { sessionId: selectedSessionId } : {}),
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

  const handleReceiptUpload = async (remittanceId: string, file: File) => {
    try {
      await uploadReceipt({ id: remittanceId, file }).unwrap();
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      toast.error(handleError(error));
    }
  };

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
        ...(remitSessionId ? { sessionId: remitSessionId } : {}),
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
        ...(remitSessionId ? { sessionId: remitSessionId } : {}),
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
    <Frame text="My Remittances">
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
          <PageCard
            padded={false}
            title="Remittance History"
            subtitle="All your payments to the admin"
            action={
              <FormControl size="sm" sx={{ minWidth: 180 }}>
                <FormLabel>Academic Session</FormLabel>
                <Select
                  size="sm"
                  value={selectedSessionId}
                  onChange={(_, val) =>
                    setSelectedSessionId((val as string) ?? "")
                  }
                  placeholder="All sessions"
                >
                  <Option value="">All sessions</Option>
                  {sessions.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            }
          >
            <RemittanceTable
              docs={docs}
              isLoading={isLoading}
              onUpload={handleReceiptUpload}
              uploading={uploadingReceipt}
            />
          </PageCard>
        </Stack>

        {/* Payment Method Modal */}
        <AppModal
          isOpen={isPayModalOpen}
          close={closePayModal}
          title="Credit Admin"
          icon
        >
          <div className="w-[min(480px,85vw)] mt-2">
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

              <FormControl>
                <FormLabel>Academic Session</FormLabel>
                <Select
                  value={remitSessionId}
                  onChange={(_, v) => setRemitSessionId((v as string) ?? "")}
                  placeholder="Select session"
                >
                  {sessions
                    .filter((s) => s.isCurrent || s.activatedAt)
                    .map((s) => (
                      <Option key={s._id} value={s._id}>
                        {s.name}{s.isCurrent ? " · Current" : ""}
                      </Option>
                    ))}
                </Select>
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
                  Pay with Stripe
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
                  Pay with Zelle
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

/* ────── Receipt Cell ────── */

const ReceiptCell = ({
  remittance,
  onUpload,
  uploading,
}: {
  remittance: Remittance;
  onUpload: (id: string, file: File) => void;
  uploading: boolean;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const receiptUrl = remittance.receiptImageUrl || remittance.receiptUrl;

  if (receiptUrl) {
    return (
      <a
        href={receiptUrl}
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
    remittance.method === "zelle" &&
    remittance.status === "pending_confirmation"
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
            if (file) onUpload(remittance._id, file);
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

/* ────── Remittance History Table ────── */

const RemittanceTable = ({
  docs,
  isLoading,
  onUpload,
  uploading,
}: {
  docs: Remittance[];
  isLoading: boolean;
  onUpload: (id: string, file: File) => void;
  uploading: boolean;
}) => {
  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="w-full text-sm text-left">
        <TableHeader>
          <tr>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Academic Session</TableHeaderCell>
            <TableHeaderCell>Method</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Receipt</TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody>
          {isLoading && docs.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <TableSkeleton columns={7} rows={5} />
              </td>
            </tr>
          ) : docs.length ? (
              docs.map((r) => (
              <TableRow key={r._id}>
                <TableCell>
                  {moment(r.createdAt).format("MM/DD/YYYY")}
                </TableCell>
                <TableCell>
                  {r.description || "School fees remittance"}
                </TableCell>
                <TableCell>
                  {r.academicYear || <EmptyValue />}
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
                  <StatusBadge status={r.status} map={REMITTANCE_STATUS} />
                </TableCell>
                <TableCell>
                  <ReceiptCell
                    remittance={r}
                    onUpload={onUpload}
                    uploading={uploading}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <CenteredEmptyState description="No remittances yet. Click 'Credit Admin' to get started." />
              </td>
            </tr>
          )}
        </TableBody>
      </table>
    </div>
  );
};
