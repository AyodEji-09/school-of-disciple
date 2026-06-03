import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
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
import { useGetSessionsQuery } from "../../data/rtk/academic";
import { CenteredEmptyState } from "../../components/query-state/QueryStates";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegFormType {
  sessionId: string;
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
  const isSuperAdmin = user?.type === "admin";
  const defaultTab = "registration";
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
              "--Tab-indicatorThickness": "2px",
            }}
          >
            <Tab
              value="registration"
              sx={{
                fontWeight: 600,
                bgcolor: "transparent",
                "&.Mui-selected": { bgcolor: "transparent" },
              }}
            >
              Registration Windows
            </Tab>

            {isSuperAdmin && (
              <Tab
                value="registration-fee"
                sx={{
                  fontWeight: 600,
                  bgcolor: "transparent",
                  "&.Mui-selected": { bgcolor: "transparent" },
                }}
              >
                Fees
              </Tab>
            )}

            {isSuperAdmin && (
              <Tab
                value="general"
                sx={{
                  fontWeight: 600,
                  bgcolor: "transparent",
                  "&.Mui-selected": { bgcolor: "transparent" },
                }}
              >
                Zelle Details
              </Tab>
            )}
          </TabList>

          <TabPanel value="registration" sx={{ p: 0 }}>
            <RegistrationTab />
          </TabPanel>

          {isSuperAdmin && (
            <TabPanel value="registration-fee" sx={{ p: 0 }}>
              <RegistrationFeeTab />
            </TabPanel>
          )}

          {isSuperAdmin && (
            <TabPanel value="general" sx={{ p: 0 }}>
              <GeneralTab />
            </TabPanel>
          )}
        </Tabs>
      </Box>
    </Frame>
  );
};

export default SettingsPage;

const RegistrationFeeTab = () => {
  const { data: settingsData, isLoading: settingsLoading } =
    useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  const [registrationFee, setRegistrationFee] = useState<number>(2000);
  const [manualOrderFee, setManualOrderFee] = useState<number>(7500);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [registrationFeeInput, setRegistrationFeeInput] = useState("20.00");
  const [manualOrderFeeInput, setManualOrderFeeInput] = useState("75.00");

  useEffect(() => {
    if (settingsData?.data?.registrationFee !== undefined) {
      setRegistrationFee(settingsData.data.registrationFee);
      setRegistrationFeeInput(
        (settingsData.data.registrationFee / 100).toFixed(2),
      );
    }
    if (settingsData?.data?.manualOrderFee !== undefined) {
      setManualOrderFee(settingsData.data.manualOrderFee);
      setManualOrderFeeInput(
        (settingsData.data.manualOrderFee / 100).toFixed(2),
      );
    }
  }, [settingsData]);

  const formattedRegistrationFee = (registrationFee / 100).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  );

  const formattedManualOrderFee = (manualOrderFee / 100).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  );

  const parsedRegistrationFeeInput = parseFloat(registrationFeeInput);
  const isValidRegistrationFee =
    registrationFeeInput.trim() !== "" &&
    !isNaN(parsedRegistrationFeeInput) &&
    parsedRegistrationFeeInput >= 0;
  const registrationFeePreview = isValidRegistrationFee
    ? parsedRegistrationFeeInput.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
    : null;

  const parsedManualOrderFeeInput = parseFloat(manualOrderFeeInput);
  const isValidManualOrderFee =
    manualOrderFeeInput.trim() !== "" &&
    !isNaN(parsedManualOrderFeeInput) &&
    parsedManualOrderFeeInput >= 0;
  const manualOrderFeePreview = isValidManualOrderFee
    ? parsedManualOrderFeeInput.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
    : null;

  const openRegistrationModal = () => {
    setRegistrationFeeInput((registrationFee / 100).toFixed(2));
    setIsRegistrationModalOpen(true);
  };

  const closeRegistrationModal = () => {
    setRegistrationFeeInput((registrationFee / 100).toFixed(2));
    setIsRegistrationModalOpen(false);
  };

  const openManualOrderModal = () => {
    setManualOrderFeeInput((manualOrderFee / 100).toFixed(2));
    setIsManualOrderModalOpen(true);
  };

  const closeManualOrderModal = () => {
    setManualOrderFeeInput((manualOrderFee / 100).toFixed(2));
    setIsManualOrderModalOpen(false);
  };

  const handleSaveRegistrationFee = async () => {
    if (!isValidRegistrationFee) {
      toast.error("Enter a valid amount");
      return;
    }

    const cents = Math.round(parsedRegistrationFeeInput * 100);

    try {
      await updateSettings({ registrationFee: cents }).unwrap();
      setRegistrationFee(cents);
      setRegistrationFeeInput((cents / 100).toFixed(2));
      toast.success("Registration fee updated");
      setIsRegistrationModalOpen(false);
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const handleSaveManualOrderFee = async () => {
    if (!isValidManualOrderFee) {
      toast.error("Enter a valid amount");
      return;
    }

    const cents = Math.round(parsedManualOrderFeeInput * 100);

    try {
      await updateSettings({ manualOrderFee: cents }).unwrap();
      setManualOrderFee(cents);
      setManualOrderFeeInput((cents / 100).toFixed(2));
      toast.success("Manual order fee updated");
      setIsManualOrderModalOpen(false);
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex justify-center py-16">
        <PulseLoader size={10} color="#001EC5" />
      </div>
    );
  }

  return (
    <Stack spacing={3}>
      <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #001F54 0%, #001EC5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              $
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography level="title-lg" sx={{ fontWeight: 700 }}>
              Registration Fee
            </Typography>
            <Typography level="body-sm" textColor="neutral.500">
              One-time fee charged to each student upon registration
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 3,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box>
            <Typography
              level="body-xs"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#9CA3AF",
                fontWeight: 600,
                mb: 0.75,
              }}
            >
              Current Amount
            </Typography>
            <Typography
              level="h2"
              sx={{ color: "#001F54", fontWeight: 800, lineHeight: 1 }}
            >
              {formattedRegistrationFee}
            </Typography>
            <Typography
              level="body-xs"
              textColor="neutral.400"
              sx={{ mt: 0.5 }}
            >
              Default registration fee shown to students
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={openRegistrationModal}
            sx={{
              borderColor: "#001F54",
              color: "#001F54",
              fontWeight: 600,
              px: 3,
              flexShrink: 0,
              ":hover": {
                bgcolor: "#001F540D",
                borderColor: "#001EC5",
                color: "#001EC5",
              },
            }}
          >
            Set Registration Fee
          </Button>
        </Box>
      </Card>

      <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              📚
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography level="title-lg" sx={{ fontWeight: 700 }}>
              Manual Order Fee
            </Typography>
            <Typography level="body-sm" textColor="neutral.500">
              Per-unit cost charged to coordinators for manual book orders
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 3,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box>
            <Typography
              level="body-xs"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#9CA3AF",
                fontWeight: 600,
                mb: 0.75,
              }}
            >
              Current Amount
            </Typography>
            <Typography
              level="h2"
              sx={{ color: "#001F54", fontWeight: 800, lineHeight: 1 }}
            >
              {formattedManualOrderFee}
            </Typography>
            <Typography
              level="body-xs"
              textColor="neutral.400"
              sx={{ mt: 0.5 }}
            >
              Charged per book unit ordered
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={openManualOrderModal}
            sx={{
              borderColor: "#001F54",
              color: "#001F54",
              fontWeight: 600,
              px: 3,
              flexShrink: 0,
              ":hover": {
                bgcolor: "#001F540D",
                borderColor: "#001EC5",
                color: "#001EC5",
              },
            }}
          >
            Set Manual Fee
          </Button>
        </Box>
      </Card>

      <AppModal
        isOpen={isRegistrationModalOpen}
        close={closeRegistrationModal}
        title="Set Registration Fee"
        icon
      >
        <div className="w-[min(440px,80vw)] mt-2">
          <Stack spacing={2.5}>
            <FormControl>
              <FormLabel>Amount (USD)</FormLabel>
              <Input
                type="number"
                value={registrationFeeInput}
                onChange={(e) => setRegistrationFeeInput(e.target.value)}
                placeholder="20.00"
                startDecorator={
                  <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>
                    $
                  </Typography>
                }
                slotProps={{ input: { min: 0, step: "0.01" } }}
                autoFocus
              />
            </FormControl>

            {registrationFeeInput !== "" && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  background: isValidRegistrationFee ? "#F0F4FF" : "#FFF5F5",
                  border: "1px solid",
                  borderColor: isValidRegistrationFee ? "#D4CAFE" : "#FECACA",
                }}
              >
                {isValidRegistrationFee ? (
                  <>
                    <Typography
                      level="body-sm"
                      sx={{ color: "#001F54", fontWeight: 600 }}
                    >
                      Students will be charged{" "}
                      <strong>{registrationFeePreview}</strong>
                    </Typography>
                    <Typography level="body-xs" textColor="neutral.500">
                      Stored internally as{" "}
                      {Math.round(parsedRegistrationFeeInput * 100)} cents
                    </Typography>
                  </>
                ) : (
                  <Typography level="body-sm" sx={{ color: "#DC2626" }}>
                    Enter a valid amount, such as 20.00
                  </Typography>
                )}
              </Box>
            )}

            <Stack direction="row" gap={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={closeRegistrationModal}
                disabled={isUpdating}
                sx={{ fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRegistrationFee}
                loading={isUpdating}
                disabled={!isValidRegistrationFee || isUpdating}
                sx={{
                  bgcolor: "#001F54",
                  ":hover": { bgcolor: "#001EC5" },
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Save Fee
              </Button>
            </Stack>
          </Stack>
        </div>
      </AppModal>

      <AppModal
        isOpen={isManualOrderModalOpen}
        close={closeManualOrderModal}
        title="Set Manual Order Fee"
        icon
      >
        <div className="w-[min(440px,80vw)] mt-2">
          <Stack spacing={2.5}>
            <FormControl>
              <FormLabel>Amount (USD)</FormLabel>
              <Input
                type="number"
                value={manualOrderFeeInput}
                onChange={(e) => setManualOrderFeeInput(e.target.value)}
                placeholder="75.00"
                startDecorator={
                  <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>
                    $
                  </Typography>
                }
                slotProps={{ input: { min: 0, step: "0.01" } }}
                autoFocus
              />
            </FormControl>

            {manualOrderFeeInput !== "" && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  background: isValidManualOrderFee ? "#F0F4FF" : "#FFF5F5",
                  border: "1px solid",
                  borderColor: isValidManualOrderFee ? "#D4CAFE" : "#FECACA",
                }}
              >
                {isValidManualOrderFee ? (
                  <>
                    <Typography
                      level="body-sm"
                      sx={{ color: "#001F54", fontWeight: 600 }}
                    >
                      Per unit cost: <strong>{manualOrderFeePreview}</strong>
                    </Typography>
                    <Typography level="body-xs" textColor="neutral.500">
                      Stored internally as{" "}
                      {Math.round(parsedManualOrderFeeInput * 100)} cents
                    </Typography>
                  </>
                ) : (
                  <Typography level="body-sm" sx={{ color: "#DC2626" }}>
                    Enter a valid amount, such as 75.00
                  </Typography>
                )}
              </Box>
            )}

            <Stack direction="row" gap={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={closeManualOrderModal}
                disabled={isUpdating}
                sx={{ fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveManualOrderFee}
                loading={isUpdating}
                disabled={!isValidManualOrderFee || isUpdating}
                sx={{
                  bgcolor: "#001F54",
                  ":hover": { bgcolor: "#001EC5" },
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Save Fee
              </Button>
            </Stack>
          </Stack>
        </div>
      </AppModal>
    </Stack>
  );
};

// ─── General Tab (super admin only) ──────────────────────────────────────────

const GeneralTab = () => {
  const { data: settingsData, isLoading: settingsLoading } =
    useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  // Zelle state (modal)
  const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
  const [zelleEmail, setZelleEmail] = useState("");
  const [zelleName, setZelleName] = useState("");

  useEffect(() => {
    if (settingsData?.data) {
      setZelleEmail(settingsData.data.zelleEmail || "");
      setZelleName(settingsData.data.zelleName || "");
    }
  }, [settingsData]);

  // ── Zelle helpers ─────────────────────────────────────────────────────────

  const hasZelleConfigured = Boolean(
    settingsData?.data?.zelleEmail && settingsData?.data?.zelleName,
  );

  const startEditZelle = () => {
    setZelleEmail(settingsData?.data?.zelleEmail || "");
    setZelleName(settingsData?.data?.zelleName || "");
    setIsZelleModalOpen(true);
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

  if (settingsLoading) {
    return (
      <div className="flex justify-center py-16">
        <PulseLoader size={10} color="#001EC5" />
      </div>
    );
  }

  return (
    <Stack spacing={3}>
      {/* ── Zelle Payment Details Card ──────────────────────────────────────── */}
      <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
        {/* Card header stripe */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              Z
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography level="title-lg" sx={{ fontWeight: 700 }}>
              Payment Settings
            </Typography>
            <Typography level="body-sm" textColor="neutral.500">
              Shown to coordinators when they choose to remit via Zelle
            </Typography>
          </Box>
          {hasZelleConfigured && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "20px",
                bgcolor: "#D1FAE5",
                border: "1px solid #6EE7B7",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#065F46",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Configured
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3 }}>
          {hasZelleConfigured ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={3}
            >
              {/* Current details */}
              <Stack direction={{ xs: "column", sm: "row" }} gap={4}>
                <Box>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#9CA3AF",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Recipient Name
                  </Typography>
                  <Typography
                    level="title-sm"
                    sx={{ color: "#001F54", fontWeight: 700 }}
                  >
                    {settingsData?.data?.zelleName}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#9CA3AF",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Zelle Email
                  </Typography>
                  <Typography
                    level="title-sm"
                    sx={{ color: "#001F54", fontWeight: 700 }}
                  >
                    {settingsData?.data?.zelleEmail}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                onClick={startEditZelle}
                sx={{
                  borderColor: "#6D28D9",
                  color: "#6D28D9",
                  fontWeight: 600,
                  px: 3,
                  flexShrink: 0,
                  ":hover": {
                    bgcolor: "rgba(109,40,217,0.06)",
                    borderColor: "#5B21B6",
                  },
                }}
              >
                Edit Details
              </Button>
            </Stack>
          ) : (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={3}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  flex: 1,
                }}
              >
                <Typography level="body-sm" sx={{ color: "#92400E" }}>
                  ⚠️ Zelle details have not been configured yet. Coordinators
                  won't be able to remit via Zelle until you set this up.
                </Typography>
              </Box>
              <Button
                onClick={startEditZelle}
                sx={{
                  bgcolor: "#6D28D9",
                  ":hover": { bgcolor: "#5B21B6" },
                  fontWeight: 600,
                  px: 3,
                  flexShrink: 0,
                }}
              >
                Set Up Zelle
              </Button>
            </Stack>
          )}

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
                  autoFocus
                />
              </FormControl>
              <FormControl>
                <FormLabel>Zelle Email / Phone</FormLabel>
                <Input
                  type="email"
                  value={zelleEmail}
                  onChange={(e) => setZelleEmail(e.target.value)}
                  placeholder="e.g. payments@church.org"
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
        </Box>
      </Card>
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
  const { data: sessionsRes } = useGetSessionsQuery();

  const currentWindow = currentWindowRes?.data;
  const status = getWindowStatus(currentWindow);
  const isSubmitting = creating || updating;
  const sessions = sessionsRes?.data ?? [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegFormType>({
    defaultValues: { sessionId: "", startDate: "", endDate: "" },
  });

  const openEditModal = () => {
    if (currentWindow) {
      setMode("edit");
      const sid =
        typeof currentWindow.sessionId === "object"
          ? (currentWindow.sessionId as any)?._id
          : currentWindow.sessionId;
      reset({
        sessionId: sid ?? "",
        startDate: moment(currentWindow.startDate).format("YYYY-MM-DDTHH:mm"),
        endDate: moment(currentWindow.endDate).format("YYYY-MM-DDTHH:mm"),
      });
    }
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    // Pre-select the current session if one exists
    const currentSession = sessions.find((s: any) => s.isCurrent);
    setMode("create");
    reset({ sessionId: currentSession?._id ?? "", startDate: "", endDate: "" });
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (currentWindow) setMode("edit");
  }, [currentWindow]);

  const onSubmit = async (data: RegFormType) => {
    const payload = {
      sessionId: data.sessionId,
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
                  {status.label === "Upcoming"
                    ? "Upcoming Registration Window"
                    : status.label === "Open"
                      ? "Active Registration Window"
                      : "Registration Window"}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Typography level="h4">
                    {currentWindow?.label ?? "No window configured yet"}
                  </Typography>
                  {currentWindow && (
                    <Chip color={status.color} variant="soft" size="md">
                      {status.label}
                    </Chip>
                  )}
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
                {/* Open or Upcoming: only allow editing, never creating a new one */}
                {(status.label === "Open" || status.label === "Upcoming") ? (
                  <AppButton type="button" onClick={openEditModal}>
                    {status.label === "Upcoming"
                      ? "Edit Upcoming Window"
                      : "Edit Window"}
                  </AppButton>
                ) : (
                  /* Closed or Not Configured: allow creating + editing if one exists */
                  <>
                    {currentWindow && (
                      <AppButton
                        type="button"
                        variant="outlined"
                        onClick={openEditModal}
                      >
                        Edit Last Window
                      </AppButton>
                    )}
                    <AppButton type="button" onClick={openCreateModal}>
                      {currentWindow ? "New Window" : "Set Window"}
                    </AppButton>
                  </>
                )}
              </Stack>
            </Stack>

            {/* Informational banner for upcoming state */}
            {status.label === "Upcoming" && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: "8px",
                  bgcolor: "#FFFBEB",
                  border: "1px solid #FDE68A",
                }}
              >
                <Typography level="body-sm" sx={{ color: "#92400E" }}>
                  ⏳ This window hasn't opened yet. Edit it if you need to
                  adjust the dates. A new window cannot be created while one is
                  already scheduled.
                </Typography>
              </Box>
            )}
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
                  name="sessionId"
                  control={control}
                  rules={{ required: "Academic session is required" }}
                  render={({ field: { value, onChange } }) => (
                    <FormControl>
                      <FormLabel>Academic Session</FormLabel>
                      <Select
                        value={value}
                        onChange={(_, val) => onChange(val)}
                        placeholder="Select a session…"
                      >
                        {sessions.map((s: any) => (
                          <Option key={s._id} value={s._id}>
                            {s.name}{s.isCurrent ? " · Current" : ""}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                {errors.sessionId && (
                  <p className="text-[#dc2626] text-xs mt-1">
                    {errors.sessionId.message}
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
