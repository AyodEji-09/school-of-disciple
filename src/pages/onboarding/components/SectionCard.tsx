import { Card, Typography } from "@mui/joy";
import type { ReactNode } from "react";

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <Card variant="outlined" className="p-0">
    <div className="border-b border-[#E5E7EB] px-4 py-4 md:px-6">
      <Typography level="title-md" textColor="#001F54">
        {title}
      </Typography>
      <Typography level="body-xs" textColor="#6B7280" sx={{ mt: 0.5 }}>
        {subtitle}
      </Typography>
    </div>
    <div className="space-y-4 px-4 py-4 md:px-6">{children}</div>
  </Card>
);

export default SectionCard;
