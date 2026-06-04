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
    <label className="flex flex-col gap-1 text-sm font-medium text-[#001F54]">
      {label}
      <div className="relative">
        <input
          type={resolvedType}
          {...otherProps}
          className={[
            "normal-case w-full rounded-md border border-[#C9C9C9] p-3 font-medium text-[#22272F] outline-none placeholder:text-sm placeholder:text-[#C9C9C9]",
            isPassword ? "pr-10" : "",
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
            className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B7280] hover:text-[#001F54] cursor-pointer"
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
