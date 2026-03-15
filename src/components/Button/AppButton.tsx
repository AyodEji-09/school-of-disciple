import { CircularProgress } from "@mui/joy";
import type { MouseEventHandler, PropsWithChildren } from "react";

type ButtonProps = {
  variant?: "primary" | "outlined" | "plain" | "red" | "link";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

const BUTTON_TYPES = {
  primary: "bg-[#001EC5] text-white text-sm",
  outlined:
    "border border-[#001EC5] rounded-md text-[#001EC5] active:bg-[#001EC51A] active:border-transparent",
  plain: "text-[#15141D]",
  red: "bg-[#FF3739] text-white",
  link: "underline",
};

const AppButton = ({
  variant = "primary",
  children,
  className,
  onClick,
  loading,
  disabled,
  type = "submit",
}: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      type={type}
      className={`h-10 px-8 rounded-md font-semibold whitespace-nowrap ${BUTTON_TYPES[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? <CircularProgress variant="soft" size="sm" /> : children}
    </button>
  );
};

export default AppButton;
