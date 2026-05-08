import { Card, Chip, Typography } from "@mui/joy";
import { Button } from "@mui/material";

type OnboardingNavbarProps = {
  title: string;
  subtitle: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
  onSaveAndExit: () => void;
  onLogout: () => void;
  saving?: boolean;
};

const OnboardingNavbar = ({
  title,
  subtitle,
  progress,
  currentStep,
  totalSteps,
  onSaveAndExit,
  onLogout,
  saving = false,
}: OnboardingNavbarProps) => (
  <Card variant="outlined">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Typography level="title-lg" textColor="#001F54">
          {title}
        </Typography>
        <Typography level="body-sm" textColor="#6B7280">
          {subtitle}
        </Typography>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Chip variant="soft" color="primary">
          Step {currentStep}/{totalSteps}
        </Chip>
        <Chip color={progress >= 100 ? "success" : "warning"} variant="soft">
          {progress}% complete
        </Chip>
        <Button type="button" variant="outlined" onClick={onSaveAndExit} disabled={saving}>
          Save & Exit
        </Button>
        <Button type="button" variant="outlined" onClick={onLogout} disabled={saving}>
          Logout
        </Button>
      </div>
    </div>
  </Card>
);

export default OnboardingNavbar;
