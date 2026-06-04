import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";

import Frame from "../../components/frame/Frame";
import AppModal from "../../components/modal/modal";
import { handleError } from "../../utils";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../data/rtk/settings";

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
      <Frame text="Fees">
        <div className="flex justify-center py-16">
          <PulseLoader size={10} color="#001EC5" />
        </div>
      </Frame>
    );
  }

  return (
    <Frame text="Fees">
      <Box sx={{ maxWidth: 960, mx: "auto", mt: 4, pb: 12 }}>
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
                      background: isValidRegistrationFee
                        ? "#F0F4FF"
                        : "#FFF5F5",
                      border: "1px solid",
                      borderColor: isValidRegistrationFee
                        ? "#D4CAFE"
                        : "#FECACA",
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
                      background: isValidManualOrderFee
                        ? "#F0F4FF"
                        : "#FFF5F5",
                      border: "1px solid",
                      borderColor: isValidManualOrderFee
                        ? "#D4CAFE"
                        : "#FECACA",
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
      </Box>
    </Frame>
  );
};

export default FeesPage;
