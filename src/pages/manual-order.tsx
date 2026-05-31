import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
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
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  RiBankCardLine,
  RiShieldCheckLine,
  RiUploadCloud2Line,
  RiCheckLine,
} from "react-icons/ri";

import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import { handleError } from "../utils";
import { useAppSelector } from "../data/hooks";
import { selectUser } from "../data/selectors/authSelector";
import {
  useCreateStripeManualOrderMutation,
  useCreateZelleManualOrderMutation,
  useGetManualOrdersQuery,
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

const ManualOrderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAppSelector(selectUser);
  const { data: zelleDetails } = useGetZelleDetailsQuery();
  const { data: settingsRes } = useGetSettingsQuery();
  const { data: manualOrdersRes, isLoading: manualOrdersLoading } =
    useGetManualOrdersQuery({ limit: 10 });
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
  const manualOrders = manualOrdersRes?.data?.docs || [];

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
      if (form.paymentMethod === "stripe") {
        const res = await createStripeManualOrder(payload).unwrap();
        if (res.data?.url) {
          window.location.href = res.data.url;
        }
        return;
      }

      await createZelleManualOrder(payload).unwrap();
      toast.success("Manual order submitted. Awaiting admin confirmation.");
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const handleReceiptUpload = async (orderId: string, file: File) => {
    try {
      await uploadReceipt({ id: orderId, file }).unwrap();
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  return (
    <Frame text="Order Manuals">
      <div className="mt-8 pb-16">
        <Card variant="outlined" className="mx-auto max-w-5xl p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* ── Form Column ── */}
            <div className="md:col-span-2 space-y-6">
              <Box>
                <Typography level="h3" textColor="#001F54">
                  Manuals Order Details
                </Typography>
                <Typography level="body-sm" textColor="#475569">
                  Each manual costs {formatCurrency(unitPrice)} per student. Enter the coordinator and
                  delivery details below.
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

                {/* Payment Method */}
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

            {/* ── Sidebar ── */}
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
                  <SummaryLine label="Quantity" value={String(quantity || 0)} />
                  <Divider sx={{ my: 0.5 }} />
                  <SummaryLine
                    label="Total"
                    value={formatCurrency(total)}
                    strong
                  />
                </Stack>
              </Card>

              {form.paymentMethod === "zelle" && (
                <Card variant="outlined" className="p-5">
                  <Typography level="title-sm" mb={1} textColor="#001F54">
                    Zelle Details
                  </Typography>
                  <Typography level="body-sm" textColor="#475569">
                    {zelleDetails?.data?.name || "Admin Name"}
                  </Typography>
                  <Typography level="body-sm" textColor="#475569">
                    {zelleDetails?.data?.email || "admin@example.com"}
                  </Typography>
                  <Typography level="body-xs" textColor="#94A3B8" mt={1}>
                    Send payment via Zelle, then upload your receipt below after
                    placing the order.
                  </Typography>
                </Card>
              )}

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
        </Card>

        {/* ── Order History ── */}
        <Card variant="outlined" className="mx-auto mt-6 max-w-5xl p-6 md:p-8">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            mb={2}
          >
            <Box>
              <Typography level="h4" textColor="#001F54">
                Manual Order History
              </Typography>
              <Typography level="body-sm" textColor="#475569">
                Your recent manual book orders and their payment status.
              </Typography>
            </Box>
          </Stack>

          {manualOrdersLoading ? (
            <div className="py-8 text-center text-slate-500">
              Loading history...
            </div>
          ) : manualOrders.length ? (
            <div className="overflow-x-auto">
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
                  {manualOrders.map((order) => (
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
                        {formatCurrency(order.amount / 100)}
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
                          uploading={uploadingReceipt}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              No manual orders yet.
            </div>
          )}
        </Card>
      </div>
    </Frame>
  );
};

export default ManualOrderPage;

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

  // Already has a receipt
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
};
