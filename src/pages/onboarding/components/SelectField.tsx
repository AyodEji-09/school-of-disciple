const baseSelectClassName =
  "w-full h-12 rounded-input border bg-surface-container-lowest px-4 font-body-md text-body-md text-charcoal outline-none transition-all focus:ring-2 disabled:bg-coolgray disabled:text-outline disabled:cursor-not-allowed cursor-pointer";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
  error?: string;
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  disabled,
  error,
}: SelectFieldProps) => (
  <label className="flex flex-col gap-1.5 font-label-md text-label-md font-medium text-charcoal">
    <span>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-invalid={Boolean(error)}
      className={`${baseSelectClassName} ${
        error
          ? "border-error focus:border-error focus:ring-error/15"
          : "border-mist focus:border-navy focus:ring-navy/15"
      }`}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <span className="font-sans text-xs font-normal text-error">{error}</span>
    )}
  </label>
);

export default SelectField;
