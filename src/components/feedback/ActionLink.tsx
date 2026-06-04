import type { MouseEventHandler, PropsWithChildren, ReactNode } from "react";

type Variant = "primary" | "success" | "danger" | "muted";

const colorClass: Record<Variant, string> = {
  primary: "text-[#001EC5] hover:text-[#001A9C]",
  success: "text-[#15803D] hover:text-[#166534]",
  danger: "text-[#DC2626] hover:text-[#B91C1C]",
  muted: "text-[#475569] hover:text-[#001F54]",
};

type ActionLinkProps = PropsWithChildren<{
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}>;

const ActionLink = ({
  onClick,
  variant = "primary",
  icon,
  children,
  className,
  disabled,
  type = "button",
}: ActionLinkProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer",
        colorClass[variant],
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? <span className="inline-flex">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
};

export default ActionLink;
