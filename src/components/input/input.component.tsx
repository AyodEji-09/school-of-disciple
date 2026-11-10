import { useState, type InputHTMLAttributes } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  type?: "text" | "email" | "password" | "number" | "date" | "datetime-local";
};

const Input = ({ label, type, ...otherProps }: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <label className="flex flex-col gap-1.5 font-label-md text-label-md font-medium text-charcoal">
      {label}
      <div className="relative">
        <input
          type={resolvedType}
          {...otherProps}
          className={[
            "normal-case w-full h-12 rounded-input border border-mist bg-surface-container-lowest px-4 font-body-md text-body-md text-charcoal outline-none transition-all placeholder:text-outline focus:border-navy focus:ring-2 focus:ring-navy/15 disabled:bg-coolgray disabled:text-outline disabled:cursor-not-allowed",
            isPassword ? "pr-11" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-outline hover:text-navy transition-colors cursor-pointer"
          >
            {showPassword ? (
              <VisibilityOff sx={{ fontSize: 20 }} />
            ) : (
              <Visibility sx={{ fontSize: 20 }} />
            )}
          </button>
        )}
      </div>
    </label>
  );
};

export default Input;
