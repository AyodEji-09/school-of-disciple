const inputClassName =
  "rounded-md border border-[#C9C9C9] p-3 font-medium text-[#22272F] outline-none placeholder:text-sm placeholder:text-[#C9C9C9]";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
};

const SelectField = ({ label, value, onChange, options }: SelectFieldProps) => (
  <label className="flex flex-col gap-1 text-sm text-[#001F54] font-medium">
    {label}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClassName}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export default SelectField;
