import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Frame from "../../components/frame/Frame";
import AppModal from "../../components/modal/modal";
import PageCard from "../../components/feedback/PageCard";
import AppButton from "../../components/Button/AppButton";
import { handleError } from "../../utils";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../data/rtk/settings";
import { PageLoader } from "../../components/query-state/QueryStates";

const FeesPage = () => {
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
    { style: "currency", currency: "USD" },
  );
  const formattedManualOrderFee = (manualOrderFee / 100).toLocaleString(
    "en-US",
    { style: "currency", currency: "USD" },
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
      <Frame text="Fees">
        <PageLoader label="Loading fees…" />
      </Frame>
    );
  }

  return (
    <Frame text="Fees">
      <div className="max-w-5xl mx-auto mt-6 pb-16 space-y-6">
        <PageCard
          title="Registration Fee"
          subtitle="One-time fee charged to each student upon registration"
          action={
            <AppButton
              type="button"
              variant="outlined"
              onClick={openRegistrationModal}
            >
              Set Registration Fee
            </AppButton>
          }
        >
          <div>
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
            <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
              Default registration fee shown to students
            </Typography>
          </div>
        </PageCard>

        <PageCard
          title="Manual Order Fee"
          subtitle="Per-unit cost charged to coordinators for manual book orders"
          action={
            <AppButton
              type="button"
              variant="outlined"
              onClick={openManualOrderModal}
            >
              Set Manual Fee
            </AppButton>
          }
        >
          <div>
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
            <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
              Charged per book unit ordered
            </Typography>
          </div>
        </PageCard>
      </div>

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
    </Frame>
  );
};

export default FeesPage;
