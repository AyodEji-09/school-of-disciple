import { Chip } from "@mui/joy";
import type { ChipProps } from "@mui/joy";
import { resolveStatus, type StatusEntry, type StatusVariant } from "../../utils/status";

type StatusBadgeProps = {
  status: string | undefined | null;
  map?: Record<string, StatusEntry>;
  fallback?: StatusEntry;
  size?: ChipProps["size"];
  variant?: ChipProps["variant"];
  className?: string;
};

const sizeClass: Record<NonNullable<ChipProps["size"]>, string> = {
  sm: "",
  md: "px-3",
  lg: "px-3.5 py-1",
};

const colorText: Record<StatusVariant, string> = {
  success: "#FFFFFF",
  warning: "#FFFFFF",
  danger: "#FFFFFF",
  neutral: "#FFFFFF",
  primary: "#FFFFFF",
};

const colorBg: Record<StatusVariant, string> = {
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  neutral: "#475569",
  primary: "#1D4ED8",
};

const colorBorder: Record<StatusVariant, string> = {
  success: "#15803D",
  warning: "#B45309",
  danger: "#B91C1C",
  neutral: "#334155",
  primary: "#1E40AF",
};

const StatusBadge = ({
  status,
  map,
  fallback,
  size = "sm",
  variant = "soft",
  className,
}: StatusBadgeProps) => {
  const entry: StatusEntry = map
    ? resolveStatus(map, status, fallback)
    : fallback ?? { label: status ?? "—", color: "neutral" };

  const isOutlined = variant === "outlined";

  return (
    <Chip
      size={size}
      variant={variant}
      className={[
        "capitalize font-medium",
        sizeClass[size ?? "sm"],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      sx={{
        backgroundColor: `${colorBg[entry.color]} !important`,
        color: `${colorText[entry.color]} !important`,
        ...(isOutlined
          ? { borderColor: `${colorBorder[entry.color]} !important` }
          : {}),
      }}
    >
      {entry.label}
    </Chip>
  );
};

export default StatusBadge;
