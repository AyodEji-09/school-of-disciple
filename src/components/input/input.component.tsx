import type { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  type?: "text" | "email" | "password" | "number" | "date" | "datetime-local";
};

const Input = ({ label, type, ...otherProps }: InputFieldProps) => {
  return (
    <label className="text-header flex flex-col gap-1">
      {label}
      <input
        type={type}
        {...otherProps}
        className="rounded-md border border-[#C9C9C9] p-3 font-medium text-[#22272F] outline-none placeholder:text-sm placeholder:text-[#C9C9C9]"
      />
    </label>
  );
};

export default Input;
