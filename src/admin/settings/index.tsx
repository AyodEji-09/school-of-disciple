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

  useEffect(() => {
    if (settingsData?.data) {
      setRegistrationFee(settingsData.data.registrationFee);
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
        </Stack>
      </Box>
    </Frame>
  );
};

export default SettingsPage;
