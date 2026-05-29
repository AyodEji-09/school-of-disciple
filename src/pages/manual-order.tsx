import { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, Chip, Divider, FormControl, FormLabel, Input, Stack, Textarea, Typography } from "@mui/joy";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";

import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import { handleError } from "../utils";
import { useAppSelector } from "../data/hooks";
import { selectUser } from "../data/selectors/authSelector";
import {
  useCreateStripeManualOrderMutation,
  useCreateZelleManualOrderMutation,
  useGetManualOrdersQuery,
} from "../data/rtk/manual-order";
import { useGetZelleDetailsQuery } from "../data/rtk/remittance";

const UNIT_PRICE = 75;

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
  const { data: manualOrdersRes, isLoading: manualOrdersLoading } =
    useGetManualOrdersQuery({ limit: 10 });
  const [createStripeManualOrder, { isLoading: stripeLoading }] =
    useCreateStripeManualOrderMutation();
  const [createZelleManualOrder, { isLoading: zelleLoading }] =
    useCreateZelleManualOrderMutation();

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

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      toast.success("Manual order submitted successfully.");
      navigate("/dashboard", { replace: true });
    } else if (success === "false") {
      toast.error("Payment was cancelled.");
    }
  }, [navigate, searchParams]);

  const quantity = Number(form.quantity || 0);
  const total = useMemo(() => quantity * UNIT_PRICE, [quantity]);
  const manualOrders = manualOrdersRes?.data?.docs || [];

  const updateField = <K extends keyof ManualOrderForm>(key: K, value: ManualOrderForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.centerName.trim()) return toast.error("Center name is required");
    if (!form.zone.trim()) return toast.error("Zone is required");
    if (!form.phone.trim()) return toast.error("Phone number is required");
    if (!form.zonalRegionalCoordinatorName.trim()) {
      return toast.error("SOD zonal/regional coordinator name is required");
    }
    if (!quantity || quantity < 1) return toast.error("Quantity must be at least 1");
    if (!form.mailingAddress.trim()) return toast.error("Mailing address is required");

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
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  return (
    <Frame text="Order Manuals">
      <div className="mt-8 pb-16">
        <Card variant="outlined" className="mx-auto max-w-5xl p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Box>
                <Typography level="h3" textColor="#001F54">
                  Manuals Order Details
                </Typography>
                <Typography level="body-sm" textColor="#475569">
                  Each manual costs $75 per student. Enter the coordinator and delivery details below.
                </Typography>
              </Box>

              <div className="grid gap-4 md:grid-cols-2">
                <FormControl>
                  <FormLabel>Coordinator Name</FormLabel>
                  <Input value={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()} readOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Coordinator Email</FormLabel>
                  <Input value={user?.email || ""} readOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Center Name</FormLabel>
                  <Input
                    value={form.centerName}
                    onChange={(e) => updateField("centerName", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Zone</FormLabel>
                  <Input
                    value={form.zone}
                    onChange={(e) => updateField("zone", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Name of SOD Zonal/Regional Coordinator</FormLabel>
                  <Input
                    value={form.zonalRegionalCoordinatorName}
                    onChange={(e) =>
                      updateField("zonalRegionalCoordinatorName", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Quantity Needed</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => updateField("quantity", e.target.value)}
                  />
                </FormControl>
                <FormControl className="md:col-span-2">
                  <FormLabel>Mailing Address</FormLabel>
                  <Textarea
                    minRows={3}
                    value={form.mailingAddress}
                    onChange={(e) => updateField("mailingAddress", e.target.value)}
                  />
                </FormControl>
                <FormControl className="md:col-span-2">
                  <FormLabel>Other Concerns</FormLabel>
                  <Textarea
                    minRows={3}
                    value={form.concerns}
                    onChange={(e) => updateField("concerns", e.target.value)}
                  />
                </FormControl>
                <FormControl className="md:col-span-2">
                  <FormLabel>Payment Method</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={form.paymentMethod === "stripe" ? "solid" : "outlined"}
                      color="primary"
                      onClick={() => updateField("paymentMethod", "stripe")}
                    >
                      Stripe
                    </Button>
                    <Button
                      type="button"
                      variant={form.paymentMethod === "zelle" ? "solid" : "outlined"}
                      color="primary"
                      onClick={() => updateField("paymentMethod", "zelle")}
                    >
                      Zelle
                    </Button>
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
                  <SummaryLine label="Price per student" value={formatCurrency(UNIT_PRICE)} />
                  <SummaryLine label="Quantity" value={String(quantity || 0)} />
                  <Divider />
                  <SummaryLine label="Total" value={formatCurrency(total)} strong />
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

        <Card variant="outlined" className="mx-auto mt-6 max-w-5xl p-6 md:p-8">
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} mb={2}>
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
            <div className="py-8 text-center text-slate-500">Loading history...</div>
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
                  </tr>
                </thead>
                <tbody className="whitespace-nowrap">
                  {manualOrders.map((order) => (
                    <tr key={order._id} className="border-b last:border-none font-medium">
                      <td className="px-4 py-3">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">{order.centerName}</td>
                      <td className="px-4 py-3">{order.quantity}</td>
                      <td className="px-4 py-3">{formatCurrency(order.amount)}</td>
                      <td className="px-4 py-3 capitalize">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <StatusChip status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">No manual orders yet.</div>
          )}
        </Card>
      </div>
    </Frame>
  );
};

export default ManualOrderPage;

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
  const config = {
    pending_payment: { color: "warning" as const, label: "Pending Payment" },
    pending_confirmation: { color: "neutral" as const, label: "Pending Confirmation" },
    paid: { color: "success" as const, label: "Paid" },
    rejected: { color: "danger" as const, label: "Rejected" },
    processing: { color: "primary" as const, label: "Processing" },
    completed: { color: "success" as const, label: "Completed" },
  };

  return (
    <Chip size="sm" color={config[status].color} variant="soft">
      {config[status].label}
    </Chip>
  );
};
