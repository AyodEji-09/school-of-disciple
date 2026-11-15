import { CircularProgress } from "@mui/joy";
import type { MouseEventHandler, PropsWithChildren } from "react";

type ButtonProps = {
  variant?: "primary" | "gold" | "outlined" | "plain" | "red" | "link";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

const BUTTON_TYPES = {
  primary:
    "bg-navy hover:bg-navy-light text-on-primary text-sm transition-colors cursor-pointer",
  gold: "bg-gold hover:bg-gold-hover text-navy text-sm font-semibold tracking-wide uppercase transition-colors shadow-sm cursor-pointer",
  outlined:
    "border border-navy rounded-md text-navy hover:bg-coolgray active:bg-navy/10 transition-colors cursor-pointer",
  plain: "text-[#15141D] cursor-pointer",
  red: "bg-[#FF3739] text-white cursor-pointer",
  link: "underline cursor-pointer",
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
