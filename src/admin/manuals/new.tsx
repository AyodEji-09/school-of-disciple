import {
  useEffect,
  useMemo,
  useState,
  type TextareaHTMLAttributes,
} from "react";
import { Box, Button, Card, Divider, Stack, Typography } from "@mui/joy";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RiBankCardLine, RiShieldCheckLine } from "react-icons/ri";

import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import AppModal from "../../components/modal/modal";
import Input from "../../components/input/input.component";
import PageCard from "../../components/feedback/PageCard";
import { handleError, getUserFullName } from "../../utils";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useCreateStripeManualOrderMutation,
  useCreateZelleManualOrderMutation,
  useUploadManualOrderReceiptMutation,
} from "../../data/rtk/manual-order";
import { useGetZelleDetailsQuery } from "../../data/rtk/remittance";
import { useGetSettingsQuery } from "../../data/rtk/settings";

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

const TextareaField = ({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-[#001F54]">
    {label}
    <textarea
      {...props}
      className="normal-case w-full rounded-md border border-[#C9C9C9] p-3 font-medium text-[#22272F] outline-none placeholder:text-sm placeholder:text-[#C9C9C9] resize-none focus:border-[#001EC5]"
    />
  </label>
);

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
    value: ManualOrderForm[K],
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

  const coordinatorName = getUserFullName(user) || "—";

  return (
    <Frame text="Order New Manuals">
      <div className="mt-3 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: form */}
          <div className="lg:col-span-2 space-y-6">
            <PageCard
              title="Manuals Order Details"
              subtitle={`Each manual costs ${formatCurrency(unitPrice)} per student. Enter the coordinator and delivery details below.`}
            >
              <Stack spacing={3}>
                {/* Read-only coordinator info */}
                <div className="rounded-xl border border-[#E6ECFF] bg-[#F8FAFC] p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Coordinator Name
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-[#001F54]">
                        {coordinatorName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Coordinator Email
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-[#001F54] break-all">
                        {user?.email || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Editable fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Center Name"
                    placeholder="e.g. RCCG The King's Court"
                    value={form.centerName}
                    onChange={(e) => updateField("centerName", e.target.value)}
                  />
                  <Input
                    label="Zone"
                    placeholder="e.g. North America Zone 1"
                    value={form.zone}
                    onChange={(e) => updateField("zone", e.target.value)}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                  <Input
                    label="Name of SOD Zonal/Regional Coordinator"
                    placeholder="Full name"
                    value={form.zonalRegionalCoordinatorName}
                    onChange={(e) =>
                      updateField(
                        "zonalRegionalCoordinatorName",
                        e.target.value,
                      )
                    }
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Quantity Needed"
                      type="number"
                      placeholder="Number of students"
                      value={form.quantity}
                      onChange={(e) => updateField("quantity", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextareaField
                      label="Mailing Address (Preferably a residential address)"
                      placeholder="Where you want the books delivered"
                      rows={3}
                      value={form.mailingAddress}
                      onChange={(e) =>
                        updateField("mailingAddress", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextareaField
                      label="Other Concerns"
                      placeholder="Any special instructions or concerns..."
                      rows={3}
                      value={form.concerns}
                      onChange={(e) => updateField("concerns", e.target.value)}
                    />
                  </div>
                </div>

                <Divider />

                {/* Payment method */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#001F54]">
                    Payment Method
                  </label>
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
                </div>
              </Stack>
            </PageCard>
          </div>

          {/* RIGHT: summary */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <PageCard title="Order Summary">
              <Stack spacing={1.2}>
                <SummaryLine
                  label="Price per student"
                  value={formatCurrency(unitPrice)}
                />
                <SummaryLine label="Quantity" value={String(quantity || 0)} />
                <Divider sx={{ my: 0.5 }} />
                <SummaryLine
                  label="Total"
                  value={formatCurrency(total)}
                  strong
                />
              </Stack>
            </PageCard>

            <AppButton
              type="button"
              loading={stripeLoading || zelleLoading}
              disabled={stripeLoading || zelleLoading}
              onClick={handleSubmit}
              className="w-full"
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
            <Typography level="body-sm" sx={{ color: "text.tertiary", mb: 2 }}>
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
    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 text-sm transition-all ${
      active
        ? "border-[#001EC5] bg-[#EEF2FF] font-semibold text-[#001EC5]"
        : "border-[#E6ECFF] bg-white font-medium text-[#475569] hover:border-[#001EC5]/40"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
