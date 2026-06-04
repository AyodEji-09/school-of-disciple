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

const ZellePage = () => {
  const { data: settingsData, isLoading: settingsLoading } =
    useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
  const [zelleEmail, setZelleEmail] = useState("");
  const [zelleName, setZelleName] = useState("");

  useEffect(() => {
    if (settingsData?.data) {
      setZelleEmail(settingsData.data.zelleEmail || "");
      setZelleName(settingsData.data.zelleName || "");
    }
  }, [settingsData]);

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
      <Frame text="Zelle Details">
        <div className="flex justify-center py-16">
          <PulseLoader size={10} color="#001EC5" />
        </div>
      </Frame>
    );
  }

  return (
    <Frame text="Zelle Details">
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
                      ⚠️ Zelle details have not been configured yet.
                      Coordinators won't be able to remit via Zelle until you
                      set this up.
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
                  <Stack
                    direction="row"
                    gap={2}
                    mt={4}
                    justifyContent="flex-end"
                  >
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
      </Box>
    </Frame>
  );
};

export default ZellePage;
