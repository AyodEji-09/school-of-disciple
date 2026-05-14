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
import { handleError } from "../../utils";

const SettingsPage = () => {
  const { data: settingsData, isLoading: settingsLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [registrationFee, setRegistrationFee] = useState<number>(0);

  useEffect(() => {
    if (settingsData?.data) {
      setRegistrationFee(settingsData.data.registrationFee);
    }
  }, [settingsData]);

  const handleUpdate = async () => {
    try {
      await updateSettings({ registrationFee }).unwrap();
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  return (
    <Frame text="System Settings">
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Card variant="soft">
          <Typography level="h4" mb={2}>
            Registration Settings
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={3}>
            <FormControl>
              <FormLabel>Registration Fee (in cents/base units)</FormLabel>
              <Input
                type="number"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(Number(e.target.value))}
                placeholder="e.g. 1000"
              />
              <Typography level="body-xs" mt={1}>
                This is the amount students will pay during registration. 
                Currently: {(registrationFee / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </Typography>
            </FormControl>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                loading={isUpdating || settingsLoading}
                onClick={handleUpdate}
                sx={{
                  background: "#001F54",
                  ":hover": { background: "#001EC5" },
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Stack>
        </Card>
      </Box>
    </Frame>
  );
};

export default SettingsPage;
