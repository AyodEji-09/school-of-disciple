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
import { handleError } from "../../utils";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../data/rtk/settings";
import { PageLoader } from "../../components/query-state/QueryStates";

const ZellePage = () => {
  const { data: settingsData, isLoading: settingsLoading } =
    useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
  const [zelleEmail, setZelleEmail] = useState("");
  const [zelleName, setZelleName] = useState("");

  const [isMoZelleModalOpen, setIsMoZelleModalOpen] = useState(false);
  const [moZelleEmail, setMoZelleEmail] = useState("");
  const [moZelleName, setMoZelleName] = useState("");

  useEffect(() => {
    if (settingsData?.data) {
      setZelleEmail(settingsData.data.zelleEmail || "");
      setZelleName(settingsData.data.zelleName || "");
      setMoZelleEmail(settingsData.data.manualOrderZelleEmail || "");
      setMoZelleName(settingsData.data.manualOrderZelleName || "");
    }
  }, [settingsData]);

  const hasZelleConfigured = Boolean(
    settingsData?.data?.zelleEmail && settingsData?.data?.zelleName,
  );

  const hasMoZelleConfigured = Boolean(
    settingsData?.data?.manualOrderZelleEmail && settingsData?.data?.manualOrderZelleName,
  );

  const startEditZelle = () => {
    setZelleEmail(settingsData?.data?.zelleEmail || "");
    setZelleName(settingsData?.data?.zelleName || "");
    setIsZelleModalOpen(true);
  };

  const startEditMoZelle = () => {
    setMoZelleEmail(settingsData?.data?.manualOrderZelleEmail || "");
    setMoZelleName(settingsData?.data?.manualOrderZelleName || "");
    setIsMoZelleModalOpen(true);
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

  const handleSaveMoZelle = async () => {
    if (!moZelleEmail.trim() || !moZelleName.trim()) {
      toast.error("Both Zelle name and email are required");
      return;
    }
    try {
      await updateSettings({
        manualOrderZelleEmail: moZelleEmail.trim(),
        manualOrderZelleName: moZelleName.trim(),
      }).unwrap();
      toast.success("Manual order Zelle details updated");
      setIsMoZelleModalOpen(false);
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  if (settingsLoading) {
    return (
      <Frame text="Zelle Details">
        <PageLoader label="Loading zelle details…" />
      </Frame>
    );
  }

  return (
    <Frame text="Zelle Details">
      <div className="max-w-5xl mx-auto mt-6 pb-16 space-y-10">
        {/* ─── Remittance Zelle ─────────────────────────────── */}
        <PageCard
          title="Remittance Zelle Details"
          subtitle="Shown to coordinators when they remit school fees via Zelle"
          action={
            hasZelleConfigured ? (
              <span className="text-[11px] font-bold text-[#15803D] bg-[#D1FAE5] border border-[#6EE7B7] px-3 py-1 rounded-full uppercase tracking-wider">
                Configured
              </span>
            ) : undefined
          }
        >
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
                sx={{ borderColor: "#001F54", color: "#001F54", fontWeight: 600, px: 3 }}
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
                  background: "#FEF3C7",
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
                  bgcolor: "#001F54",
                  ":hover": { bgcolor: "#001EC5" },
                  fontWeight: 600,
                  px: 3,
                  flexShrink: 0,
                }}
              >
                Set Up Zelle
              </Button>
            </Stack>
          )}
        </PageCard>

        {/* ─── Manual Order Zelle ──────────────────────────── */}
        <PageCard
          title="Manual Order Zelle Details"
          subtitle="Shown to coordinators when they pay for manual books via Zelle"
          action={
            hasMoZelleConfigured ? (
              <span className="text-[11px] font-bold text-[#15803D] bg-[#D1FAE5] border border-[#6EE7B7] px-3 py-1 rounded-full uppercase tracking-wider">
                Configured
              </span>
            ) : undefined
          }
        >
          {hasMoZelleConfigured ? (
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
                    {settingsData?.data?.manualOrderZelleName}
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
                    {settingsData?.data?.manualOrderZelleEmail}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                onClick={startEditMoZelle}
                sx={{ borderColor: "#001F54", color: "#001F54", fontWeight: 600, px: 3 }}
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
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  flex: 1,
                }}
              >
                <Typography level="body-sm" sx={{ color: "#92400E" }}>
                  ⚠️ Manual order Zelle details have not been configured yet.
                  Coordinators won't be able to pay for manuals via Zelle until
                  you set this up.
                </Typography>
              </Box>
              <Button
                onClick={startEditMoZelle}
                sx={{
                  bgcolor: "#001F54",
                  ":hover": { bgcolor: "#001EC5" },
                  fontWeight: 600,
                  px: 3,
                  flexShrink: 0,
                }}
              >
                Set Up Zelle
              </Button>
            </Stack>
          )}
        </PageCard>
      </div>

      {/* Remittance Zelle Modal */}
      <AppModal
        isOpen={isZelleModalOpen}
        close={() => setIsZelleModalOpen(false)}
        title="Remittance Zelle Details"
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

      {/* Manual Order Zelle Modal */}
      <AppModal
        isOpen={isMoZelleModalOpen}
        close={() => setIsMoZelleModalOpen(false)}
        title="Manual Order Zelle Details"
        icon
      >
        <div className="w-[min(440px,80vw)] mt-2 space-y-4">
          <FormControl>
            <FormLabel>Recipient Name</FormLabel>
            <Input
              value={moZelleName}
              onChange={(e) => setMoZelleName(e.target.value)}
              placeholder="e.g. John Smith"
              autoFocus
            />
          </FormControl>
          <FormControl>
            <FormLabel>Zelle Email / Phone</FormLabel>
            <Input
              type="email"
              value={moZelleEmail}
              onChange={(e) => setMoZelleEmail(e.target.value)}
              placeholder="e.g. payments@church.org"
            />
          </FormControl>
          <Stack direction="row" gap={2} mt={4} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setIsMoZelleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMoZelle} loading={isUpdating}>
              Save Details
            </Button>
          </Stack>
        </div>
      </AppModal>
    </Frame>
  );
};

export default ZellePage;
