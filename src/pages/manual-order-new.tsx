import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RiArrowLeftLine, RiBankCardLine, RiShieldCheckLine } from "react-icons/ri";

import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import AppModal from "../components/modal/modal";
import { handleError } from "../utils";
import { useAppSelector } from "../data/hooks";
import { selectUser } from "../data/selectors/authSelector";
import {
  useCreateStripeManualOrderMutation,
  useCreateZelleManualOrderMutation,
  useUploadManualOrderReceiptMutation,
} from "../data/rtk/manual-order";
import { useGetZelleDetailsQuery } from "../data/rtk/remittance";
import { useGetSettingsQuery } from "../data/rtk/settings";

type ManualOrderForm = {
  centerName: string;
  zone: string;
  phone: string;
  zonalRegionalCoordinatorName: string;
  quantity: string;
  mailingAddress: string;
  concerns: string;
  paymentMethod: "stripe" | "zelle";
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ManualOrderNewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAppSelector(selectUser);
  const { data: zelleDetails } = useGetZelleDetailsQuery();
  const { data: settingsRes } = useGetSettingsQuery();
  const [createStripeManualOrder, { isLoading: stripeLoading }] =
    useCreateStripeManualOrderMutation();
  const [createZelleManualOrder, { isLoading: zelleLoading }] =
    useCreateZelleManualOrderMutation();
  const [uploadReceipt, { isLoading: uploadingReceipt }] =
    useUploadManualOrderReceiptMutation();

  const [form, setForm] = useState<ManualOrderForm>({
    centerName: "",
    zone: "",
    phone: "",
    zonalRegionalCoordinatorName: "",
    quantity: "1",
    mailingAddress: "",
    concerns: "",
    paymentMethod: "stripe",
  });

  const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Prefill coordinator details from user profile
  useEffect(() => {
    if (!user) return;
    const centerName =
      typeof user.center === "string" ? "" : user.center?.name || "";
    setForm((prev) => ({
      ...prev,
      centerName: prev.centerName || centerName,
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  // Handle Stripe redirect
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      toast.success("Manual order submitted successfully.");
      navigate("/dashboard/manual-order", { replace: true });
    } else if (success === "false") {
      toast.error("Payment was cancelled.");
    }
  }, [navigate, searchParams]);

  const unitPrice = (settingsRes?.data?.manualOrderFee ?? 7500) / 100;
  const quantity = Number(form.quantity || 0);
  const total = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);

  const updateField = <K extends keyof ManualOrderForm>(
    key: K,
    value: ManualOrderForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.centerName.trim()) return toast.error("Center name is required");
    if (!form.zone.trim()) return toast.error("Zone is required");
    if (!form.phone.trim()) return toast.error("Phone number is required");
    if (!form.zonalRegionalCoordinatorName.trim()) {
      return toast.error("SOD zonal/regional coordinator name is required");
    }
    if (!quantity || quantity < 1)
      return toast.error("Quantity must be at least 1");
    if (!form.mailingAddress.trim())
      return toast.error("Mailing address is required");

    if (form.paymentMethod === "zelle") {
      if (!zelleDetails?.data?.email || !zelleDetails?.data?.name) {
        toast.error("Admin has not configured Zelle payment details yet.");
        return;
      }
      setIsZelleModalOpen(true);
      return;
    }

    const payload = {
      centerName: form.centerName.trim(),
      zone: form.zone.trim(),
      phone: form.phone.trim(),
      zonalRegionalCoordinatorName: form.zonalRegionalCoordinatorName.trim(),
      quantity,
      mailingAddress: form.mailingAddress.trim(),
      concerns: form.concerns.trim(),
    };

    try {
      const res = await createStripeManualOrder(payload).unwrap();
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const submitZellePayment = async () => {
    const payload = {
      centerName: form.centerName.trim(),
      zone: form.zone.trim(),
      phone: form.phone.trim(),
      zonalRegionalCoordinatorName: form.zonalRegionalCoordinatorName.trim(),
      quantity,
      mailingAddress: form.mailingAddress.trim(),
      concerns: form.concerns.trim(),
    };

    try {
      const result = await createZelleManualOrder(payload).unwrap();

      const orderId = result?.data?.order?._id;
      if (receiptFile && orderId) {
        try {
          await uploadReceipt({ id: orderId, file: receiptFile }).unwrap();
        } catch {
          toast.warn(
            "Manual order submitted but receipt upload failed. You can upload it from your history.",
          );
        }
      }

      toast.success("Manual order submitted. Awaiting admin confirmation.");
      closeZelleModal();
      navigate("/dashboard/manual-order", { replace: true });
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const closeZelleModal = () => {
    setIsZelleModalOpen(false);
    setReceiptFile(null);
  };

  return (
    <Frame text="Order New Manuals">
      <div className="mt-3 pb-16">
        <button
          type="button"
          onClick={() => navigate("/dashboard/manual-order")}
          className="inline-flex items-center gap-1 text-sm text-[#001EC5] hover:underline font-medium mb-4"
        >
          <RiArrowLeftLine size={16} />
          Back to Manuals
        </button>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Box>
              <Typography level="h3" textColor="#001F54">
                Manuals Order Details
              </Typography>
              <Typography level="body-sm" textColor="#475569">
                Each manual costs {formatCurrency(unitPrice)} per student.
                Enter the coordinator and delivery details below.
              </Typography>
            </Box>

            <div className="grid gap-4 md:grid-cols-2">
              <FormControl>
                <FormLabel>Coordinator Name</FormLabel>
                <Input
                  value={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
                  readOnly
                />
              </FormControl>
              <FormControl>
                <FormLabel>Coordinator Email</FormLabel>
                <Input value={user?.email || ""} readOnly />
              </FormControl>
              <FormControl>
                <FormLabel>Center Name</FormLabel>
                <Input
                  placeholder="e.g. RCCG The King's Court"
                  value={form.centerName}
                  onChange={(e) => updateField("centerName", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Zone</FormLabel>
                <Input
                  placeholder="e.g. North America Zone 1"
                  value={form.zone}
                  onChange={(e) => updateField("zone", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Name of SOD Zonal/Regional Coordinator</FormLabel>
                <Input
                  placeholder="Full name"
                  value={form.zonalRegionalCoordinatorName}
                  onChange={(e) =>
                    updateField(
                      "zonalRegionalCoordinatorName",
                      e.target.value
                    )
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Quantity Needed</FormLabel>
                <Input
                  type="number"
                  slotProps={{ input: { min: 1 } }}
                  placeholder="Number of students"
                  value={form.quantity}
                  onChange={(e) => updateField("quantity", e.target.value)}
                />
              </FormControl>
              <FormControl className="md:col-span-2">
                <FormLabel>
                  Mailing Address (Preferably a residential address)
                </FormLabel>
                <Textarea
                  minRows={3}
                  placeholder="Where you want the books delivered"
                  value={form.mailingAddress}
                  onChange={(e) =>
                    updateField("mailingAddress", e.target.value)
                  }
                />
              </FormControl>
              <FormControl className="md:col-span-2">
                <FormLabel>Other Concerns</FormLabel>
                <Textarea
                  minRows={3}
                  placeholder="Any special instructions or concerns..."
                  value={form.concerns}
                  onChange={(e) => updateField("concerns", e.target.value)}
                />
              </FormControl>

              <FormControl className="md:col-span-2">
                <FormLabel>Payment Method</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  <PaymentMethodBtn
                    label="Credit Card"
                    icon={<RiBankCardLine size={20} />}
                    active={form.paymentMethod === "stripe"}
                    onClick={() => updateField("paymentMethod", "stripe")}
                  />
                  <PaymentMethodBtn
                    label="Zelle"
                    icon={<RiShieldCheckLine size={20} />}
                    active={form.paymentMethod === "zelle"}
                    onClick={() => updateField("paymentMethod", "zelle")}
                  />
                </div>
              </FormControl>
            </div>
          </div>

          <div className="space-y-4">
            <Card variant="soft" className="p-5 bg-[#F5FAFF]">
              <Typography level="title-md" textColor="#001F54" mb={1}>
                Order Summary
              </Typography>
              <Stack spacing={1.2}>
                <SummaryLine
                  label="Price per student"
                  value={formatCurrency(unitPrice)}
                />
                <SummaryLine
                  label="Quantity"
                  value={String(quantity || 0)}
                />
                <Divider sx={{ my: 0.5 }} />
                <SummaryLine
                  label="Total"
                  value={formatCurrency(total)}
                  strong
                />
              </Stack>
            </Card>

            <AppButton
              type="button"
              loading={stripeLoading || zelleLoading}
              disabled={stripeLoading || zelleLoading}
              onClick={handleSubmit}
            >
              Place Order
            </AppButton>
          </div>
        </div>
      </div>

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
              Send the payment to the admin using Zelle with the details below:
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
                  {zelleDetails?.data?.name || "—"}
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
                  {zelleDetails?.data?.email || "—"}
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
                  {formatCurrency(total)}
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
              receipt from their end. Your order will show as{" "}
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
    </Frame>
  );
};

export default ManualOrderNewPage;

/* ─── Sub-components ─────────────────────────────────────────────────── */

const SummaryLine = ({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4">
    <Typography level="body-sm" textColor="#475569">
      {label}
    </Typography>
    <Typography level={strong ? "title-md" : "body-md"} textColor="#001F54">
      {value}
    </Typography>
  </div>
);

const PaymentMethodBtn = ({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: "14px 8px",
      borderRadius: 12,
      border: active ? "2px solid #001EC5" : "1.5px solid #E2E8F0",
      background: active ? "#EEF2FF" : "#fff",
      color: active ? "#001EC5" : "#64748B",
      cursor: "pointer",
      transition: "all 0.15s ease",
      fontWeight: active ? 600 : 500,
      fontSize: 13,
    }}
  >
    {icon}
    {label}
  </button>
);
