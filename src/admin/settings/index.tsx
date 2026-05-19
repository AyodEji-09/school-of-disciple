import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import moment from "moment";

import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import InputField from "../../components/input/input.component";
import AppModal from "../../components/modal/modal";
import { handleError } from "../../utils";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../data/rtk/settings";
import {
  useGetRegistrationWindowQuery,
  useGetAllRegistrationWindowsQuery,
  useSetRegistrationWindowMutation,
  useUpdateRegistrationWindowMutation,
} from "../../data/rtk/registration";
import { CenteredEmptyState } from "../../components/query-state/QueryStates";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegFormType {
  label: string;
  startDate: string;
  endDate: string;
}

type WindowStatus = {
  label: "Open" | "Upcoming" | "Closed" | "Not Configured";
  color: "success" | "warning" | "danger" | "neutral";
};

const getWindowStatus = (win?: RegistrationWindow | null): WindowStatus => {
  if (!win) return { label: "Not Configured", color: "neutral" };
  const now = new Date();
  const start = new Date(win.startDate);
  const end = new Date(win.endDate);
  if (now < start) return { label: "Upcoming", color: "warning" };
  if (now > end) return { label: "Closed", color: "danger" };
  return { label: "Open", color: "success" };
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SettingsPage = () => {
  const user = useAppSelector(selectUser);
  const isSuperAdmin = user?.type === "super";
  const defaultTab = isSuperAdmin ? "general" : "registration";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <Frame text="Settings">
      <Box sx={{ maxWidth: 960, mx: "auto", mt: 4, pb: 12 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val as string)}
          sx={{ bgcolor: "transparent" }}
        >
          <TabList
            sx={{
              mb: 4,
              borderBottom: "2px solid",
              borderColor: "divider",
              "--Tab-indicatorThickness": "2px",
            }}
          >
            {isSuperAdmin && (
              <Tab value="general" sx={{ fontWeight: 600 }}>
                General
              </Tab>
            )}
            <Tab value="registration" sx={{ fontWeight: 600 }}>
              Registration Windows
            </Tab>
          </TabList>

          {isSuperAdmin && (
            <TabPanel value="general" sx={{ p: 0 }}>
              <GeneralTab />
            </TabPanel>
          )}

          <TabPanel value="registration" sx={{ p: 0 }}>
            <RegistrationTab />
          </TabPanel>
        </Tabs>
      </Box>
    </Frame>
  );
};

export default SettingsPage;

// ─── General Tab (super admin only) ──────────────────────────────────────────

const GeneralTab = () => {
  const { data: settingsData, isLoading: settingsLoading } =
    useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  const [registrationFee, setRegistrationFee] = useState<number>(0);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [newFee, setNewFee] = useState<number | string>("");

  const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
  const [zelleEmail, setZelleEmail] = useState("");
  const [zelleName, setZelleName] = useState("");

  useEffect(() => {
    if (settingsData?.data) {
      setRegistrationFee(settingsData.data.registrationFee);
      setZelleEmail(settingsData.data.zelleEmail || "");
      setZelleName(settingsData.data.zelleName || "");
    }
  }, [settingsData]);

  const formattedFee = (registrationFee / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const handleSaveNewFee = async () => {
    const feeNum = Number(newFee);
    if (Number.isNaN(feeNum) || feeNum < 0) {
      toast.error("Enter a valid non-negative fee in base units (e.g. 1000)");
      return;
    }
    try {
      await updateSettings({ registrationFee: feeNum }).unwrap();
      setRegistrationFee(feeNum);
      toast.success("Registration fee updated");
      setIsFeeModalOpen(false);
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const handleSaveZelle = async () => {
    if (!zelleEmail.trim() || !zelleName.trim()) {
      toast.error("Both Zelle name and email are required");
      return;
    }
    try {
      await updateSettings({
        zelleEmail: zelleEmail.trim(),
        zelleName: zelleName.trim(),
      }).unwrap();
      toast.success("Zelle details updated");
      setIsZelleModalOpen(false);
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const hasZelleConfigured = Boolean(
    settingsData?.data?.zelleEmail && settingsData?.data?.zelleName,
  );

  if (settingsLoading) {
    return (
      <div className="flex justify-center py-16">
        <PulseLoader size={10} color="#001EC5" />
      </div>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Registration Fee + Zelle side by side */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 1, p: 3 }}>
          <Typography level="title-lg">Registration Fee</Typography>
          <Typography level="body-sm" sx={{ mt: 1, color: "text.tertiary" }}>
            Current fee: <strong>{formattedFee}</strong>
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setNewFee(registrationFee ?? "");
                setIsFeeModalOpen(true);
              }}
              sx={{
                background: "#001F54",
                ":hover": { background: "#001EC5" },
              }}
            >
              Set Amount
            </Button>
          </Box>
        </Card>

        <Card sx={{ flex: 1, p: 3 }}>
          <Typography level="title-lg">Zelle Payment Details</Typography>
          <Typography level="body-sm" sx={{ mt: 1, color: "text.tertiary" }}>
            Coordinators see these details when paying via Zelle.
          </Typography>
          {hasZelleConfigured ? (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "md",
                background: "#F0F4FF",
                border: "1px solid #D4CAFE",
              }}
            >
              <Stack spacing={0.5}>
                <Typography level="body-xs" textColor="neutral">
                  Name
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {settingsData?.data?.zelleName}
                </Typography>
                <Typography level="body-xs" textColor="neutral" sx={{ mt: 1 }}>
                  Email
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {settingsData?.data?.zelleEmail}
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "md",
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
              }}
            >
              <Typography level="body-sm" sx={{ color: "#92400E" }}>
                ⚠️ Not configured yet. Coordinators won't be able to use Zelle
                until you set this up.
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setZelleEmail(settingsData?.data?.zelleEmail || "");
                setZelleName(settingsData?.data?.zelleName || "");
                setIsZelleModalOpen(true);
              }}
              sx={{
                background: "#001F54",
                ":hover": { background: "#001EC5" },
              }}
            >
              {hasZelleConfigured ? "Update Zelle" : "Set Up Zelle"}
            </Button>
          </Box>
        </Card>
      </Stack>

      {/* Fee Modal */}
      <AppModal
        isOpen={isFeeModalOpen}
        close={() => setIsFeeModalOpen(false)}
        title="Set Registration Amount"
        icon
      >
        <div className="w-[min(440px,80vw)] mt-2">
          <FormControl>
            <FormLabel>Amount (in cents / base units)</FormLabel>
            <Input
              type="number"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="e.g. 1000"
              slotProps={{ input: { min: 0 } }}
            />
            <Typography level="body-xs" mt={1} textColor="neutral">
              Enter the amount in base units (no decimals). e.g. 1000 = $10.00
            </Typography>
            {Number.isFinite(Number(newFee)) && (
              <Typography level="body-sm" mt={0.5} textColor="neutral">
                Equals:{" "}
                {(Number(newFee) / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography>
            )}
          </FormControl>
          <Stack direction="row" gap={2} mt={4} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setIsFeeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewFee} loading={isUpdating}>
              Save Amount
            </Button>
          </Stack>
        </div>
      </AppModal>

      {/* Zelle Modal */}
      <AppModal
        isOpen={isZelleModalOpen}
        close={() => setIsZelleModalOpen(false)}
        title="Zelle Payment Details"
        icon
      >
        <div className="w-[min(440px,80vw)] mt-2 space-y-4">
          <FormControl>
            <FormLabel>Recipient Name</FormLabel>
            <Input
              value={zelleName}
              onChange={(e) => setZelleName(e.target.value)}
              placeholder="e.g. John Smith"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Zelle Email</FormLabel>
            <Input
              type="email"
              value={zelleEmail}
              onChange={(e) => setZelleEmail(e.target.value)}
              placeholder="e.g. admin@example.com"
            />
          </FormControl>
          <Stack direction="row" gap={2} mt={4} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setIsZelleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveZelle} loading={isUpdating}>
              Save Details
            </Button>
          </Stack>
        </div>
      </AppModal>
    </Stack>
  );
};

// ─── Registration Tab ─────────────────────────────────────────────────────────

const RegistrationTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const { data: currentWindowRes, isLoading: loadingCurrent } =
    useGetRegistrationWindowQuery();
  const { data: allWindowsRes, isLoading: loadingAll } =
    useGetAllRegistrationWindowsQuery({ page: 1, limit: 20 });
  const [setWindow, { isLoading: creating }] =
    useSetRegistrationWindowMutation();
  const [updateWindow, { isLoading: updating }] =
    useUpdateRegistrationWindowMutation();

  const currentWindow = currentWindowRes?.data;
  const status = getWindowStatus(currentWindow);
  const isSubmitting = creating || updating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegFormType>({
    defaultValues: { label: "", startDate: "", endDate: "" },
  });

  const openEditModal = () => {
    if (currentWindow) {
      setMode("edit");
      reset({
        label: currentWindow.label,
        startDate: moment(currentWindow.startDate).format("YYYY-MM-DDTHH:mm"),
        endDate: moment(currentWindow.endDate).format("YYYY-MM-DDTHH:mm"),
      });
    }
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setMode("create");
    reset({ label: "", startDate: "", endDate: "" });
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (currentWindow) setMode("edit");
  }, [currentWindow]);

  const onSubmit = async (data: RegFormType) => {
    const payload = {
      label: data.label,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };
    try {
      if (mode === "edit" && currentWindow?._id) {
        await updateWindow({ id: currentWindow._id, ...payload }).unwrap();
        toast.success("Registration window updated");
      } else {
        await setWindow(payload).unwrap();
        toast.success("Registration window created");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  return (
    <Stack spacing={4}>
      {loadingCurrent ? (
        <div className="flex justify-center py-12">
          <PulseLoader size={10} color="#001EC5" />
        </div>
      ) : (
        <>
          {/* Active window card */}
          <Card variant="outlined">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <div className="space-y-1">
                <Typography level="body-sm" textColor="#6B7280">
                  Active Registration Window
                </Typography>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Typography level="h4">
                    {currentWindow?.label ?? "No window configured yet"}
                  </Typography>
                  <Chip color={status.color} variant="soft" size="md">
                    {status.label}
                  </Chip>
                </Stack>
                {currentWindow ? (
                  <Typography level="body-sm" textColor="#6B7280">
                    {moment(currentWindow.startDate).format(
                      "MM/DD/YYYY, HH:mm",
                    )}{" "}
                    &mdash;{" "}
                    {moment(currentWindow.endDate).format("MM/DD/YYYY, HH:mm")}
                  </Typography>
                ) : (
                  <Typography level="body-sm" textColor="#9CA3AF">
                    No registration period configured. Set one to allow students
                    to register.
                  </Typography>
                )}
              </div>
              <Stack direction="row" gap={2} flexShrink={0}>
                {currentWindow && (
                  <AppButton
                    type="button"
                    variant="outlined"
                    onClick={openEditModal}
                  >
                    Edit Window
                  </AppButton>
                )}
                <AppButton type="button" onClick={openCreateModal}>
                  {currentWindow ? "New Window" : "Set Window"}
                </AppButton>
              </Stack>
            </Stack>
          </Card>

          {/* History */}
          <div>
            <Typography level="title-lg" mb={2}>
              History
            </Typography>
            <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
              {loadingAll ? (
                <div className="flex justify-center py-12">
                  <PulseLoader size={8} color="#001EC5" />
                </div>
              ) : allWindowsRes?.data?.docs?.length ? (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-sm text-left text-[#001F54]">
                    <thead className="text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Label</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">
                          Start Date
                        </th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">
                          End Date
                        </th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="whitespace-nowrap">
                      {allWindowsRes.data.docs.map((win) => {
                        const s = getWindowStatus(win);
                        const isCurrent = win._id === currentWindow?._id;
                        return (
                          <tr
                            key={win._id}
                            className={`border-b border-[#F3F4F6] ${isCurrent ? "bg-[#F0F4FF]" : ""}`}
                          >
                            <td className="px-6 py-4 font-medium">
                              <Stack
                                direction="row"
                                alignItems="center"
                                gap={1}
                              >
                                {win.label}
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-[#001EC5] bg-[#E0E7FF] px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </Stack>
                            </td>
                            <td className="px-6 py-4">
                              {moment(win.startDate).format(
                                "MM/DD/YYYY, HH:mm",
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {moment(win.endDate).format("MM/DD/YYYY, HH:mm")}
                            </td>
                            <td className="px-6 py-4">
                              <Chip color={s.color} variant="soft" size="sm">
                                {s.label}
                              </Chip>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16">
                  <CenteredEmptyState description="No registration windows yet" />
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* Modal */}
      <AppModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        title={
          mode === "edit"
            ? "Update Registration Window"
            : "Set Registration Window"
        }
        icon
      >
        <div className="w-[min(440px,80vw)] mt-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <Controller
                  name="label"
                  control={control}
                  rules={{ required: "Label is required" }}
                  render={({ field: { value, onChange } }) => (
                    <InputField
                      label="Label"
                      value={value}
                      onChange={onChange}
                      placeholder="e.g. 2025/2026 Academic Year"
                    />
                  )}
                />
                {errors.label && (
                  <p className="text-[#dc2626] text-xs mt-1">
                    {errors.label.message}
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Start date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <InputField
                      label="Start Date & Time"
                      type="datetime-local"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.startDate && (
                  <p className="text-[#dc2626] text-xs mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: "End date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <InputField
                      label="End Date & Time"
                      type="datetime-local"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.endDate && (
                  <p className="text-[#dc2626] text-xs mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
            <Stack direction="row" gap={2} mt={4}>
              <AppButton loading={isSubmitting} disabled={isSubmitting}>
                {mode === "edit" ? "Update Window" : "Set Window"}
              </AppButton>
              <AppButton
                type="button"
                variant="outlined"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </AppButton>
            </Stack>
          </form>
        </div>
      </AppModal>
    </Stack>
  );
};
