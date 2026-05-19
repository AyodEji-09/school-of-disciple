import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
  Card,
  Divider,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../data/rtk/settings";
import { useGetRegistrationWindowQuery } from "../../data/rtk/registration";
import { handleError } from "../../utils";
import AppModal from "../../components/modal/modal";
import { Link } from "react-router-dom";

const SettingsPage = () => {
  const { data: settingsData, isLoading: settingsLoading } = useGetSettingsQuery();
  const { data: registrationWindowRes, isLoading: windowLoading } = useGetRegistrationWindowQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [registrationFee, setRegistrationFee] = useState<number>(0);
  const registrationWindow = registrationWindowRes?.data;

  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [newFee, setNewFee] = useState<number | string>("");

  // Zelle details state
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

  const openFeeModal = () => {
    setNewFee(registrationFee ?? "");
    setIsFeeModalOpen(true);
  };

  const closeFeeModal = () => setIsFeeModalOpen(false);

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
      closeFeeModal();
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  // Zelle handlers
  const openZelleModal = () => {
    setZelleEmail(settingsData?.data?.zelleEmail || "");
    setZelleName(settingsData?.data?.zelleName || "");
    setIsZelleModalOpen(true);
  };

  const closeZelleModal = () => setIsZelleModalOpen(false);

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
      closeZelleModal();
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const hasZelleConfigured = Boolean(settingsData?.data?.zelleEmail && settingsData?.data?.zelleName);

  return (
    <Frame text="System Settings">
      <Box sx={{ maxWidth: 920, mx: "auto", mt: 4, pb: 10, px: { xs: 0, md: 2 } }}>
        <Stack spacing={3}>
          <Card variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: "lg" }}>
            <Typography level="h3">Settings</Typography>
            <Typography level="body-sm" sx={{ mt: 0.75, color: "text.tertiary" }}>
              Core system configuration for registration and payments.
            </Typography>
          </Card>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Card sx={{ flex: 1, p: 3 }}>
              <Typography level="title-lg">Set Reg Amount</Typography>
              <Typography level="body-sm" sx={{ mt: 1, color: "text.tertiary" }}>
                Current amount: <strong>{formattedFee}</strong>
              </Typography>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={openFeeModal} sx={{ background: "#001F54", ":hover": { background: "#001EC5" } }}>
                  Set Amount
                </Button>
              </Box>
            </Card>

            <Card sx={{ flex: 1, p: 3 }}>
              <Typography level="title-lg">Registration</Typography>
              <Typography level="body-sm" sx={{ mt: 1, color: "text.tertiary" }}>
                {registrationWindow
                  ? `${registrationWindow.label}: ${new Date(registrationWindow.startDate).toLocaleString()} - ${new Date(registrationWindow.endDate).toLocaleString()}`
                  : "No active registration window is configured yet."}
              </Typography>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button component={Link} to="/dashboard/settings/registation" sx={{ background: "#001F54", ":hover": { background: "#001EC5" } }}>
                  Manage Registration
                </Button>
              </Box>
            </Card>
          </Stack>

          {/* Zelle Payment Details Card */}
          <Card sx={{ p: 3 }}>
            <Typography level="title-lg">Zelle Payment Details</Typography>
            <Typography level="body-sm" sx={{ mt: 1, color: "text.tertiary" }}>
              Coordinators will see these details when they choose to pay via Zelle.
            </Typography>

            {hasZelleConfigured ? (
              <Box sx={{ mt: 2, p: 2, borderRadius: "md", background: "#F0F4FF", border: "1px solid #D4CAFE" }}>
                <Stack spacing={1}>
                  <Box>
                    <Typography level="body-xs" sx={{ color: "text.tertiary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Name
                    </Typography>
                    <Typography level="body-md" sx={{ fontWeight: 600 }}>
                      {settingsData?.data?.zelleName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography level="body-xs" sx={{ color: "text.tertiary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Email
                    </Typography>
                    <Typography level="body-md" sx={{ fontWeight: 600 }}>
                      {settingsData?.data?.zelleEmail}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ mt: 2, p: 2, borderRadius: "md", background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <Typography level="body-sm" sx={{ color: "#92400E" }}>
                  ⚠️ Zelle details not configured yet. Coordinators will not be able to use Zelle payments until you set this up.
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={openZelleModal} sx={{ background: "#001F54", ":hover": { background: "#001EC5" } }}>
                {hasZelleConfigured ? "Update Zelle Details" : "Set Up Zelle"}
              </Button>
            </Box>
          </Card>

          {/* Registration Fee Modal */}
          <AppModal isOpen={isFeeModalOpen} close={closeFeeModal} title="Set Registration Amount" icon>
            <div className="w-[min(440px,80vw)] mt-2">
              <div className="space-y-4">
                <FormControl>
                  <FormLabel>Amount (in cents / base units)</FormLabel>
                  <Input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    placeholder="e.g. 1000"
                    slotProps={{ input: { min: 0 } }}
                  />
                  <Typography level="body-xs" mt={1}>
                    Enter the amount charged during registration in base units (no decimals).
                  </Typography>

                  <Typography level="body-sm" mt={1} sx={{ color: "text.secondary" }}>
                    Equals: {Number.isFinite(Number(newFee)) ? ((Number(newFee) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })) : "-"}
                  </Typography>
                </FormControl>

                <Stack direction="row" gap={2} mt={4} justifyContent="flex-end">
                  <Button variant="outlined" onClick={closeFeeModal}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNewFee} loading={isUpdating}>
                    Save Amount
                  </Button>
                </Stack>
              </div>
            </div>
          </AppModal>

          {/* Zelle Details Modal */}
          <AppModal isOpen={isZelleModalOpen} close={closeZelleModal} title="Zelle Payment Details" icon>
            <div className="w-[min(440px,80vw)] mt-2">
              <div className="space-y-4">
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Enter the Zelle account details that coordinators will use to send payments.
                </Typography>

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
                  <Button variant="outlined" onClick={closeZelleModal}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveZelle} loading={isUpdating}>
                    Save Details
                  </Button>
                </Stack>
              </div>
            </div>
          </AppModal>
        </Stack>
      </Box>
    </Frame>
  );
};

export default SettingsPage;

