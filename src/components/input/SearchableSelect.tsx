import { Autocomplete } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";
import { useMemo } from "react";

export interface SearchableOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  allOptionLabel?: string;
  size?: "sm" | "md" | "lg";
  sx?: SxProps;
  className?: string;
  disabled?: boolean;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  allOptionLabel,
  size = "sm",
  sx,
  className,
  disabled = false,
}: SearchableSelectProps) => {
  const fullOptions = useMemo<SearchableOption[]>(() => {
    if (!allOptionLabel) return options;
    return [{ value: "", label: allOptionLabel }, ...options];
  }, [options, allOptionLabel]);

  const selectedOption = useMemo<SearchableOption | null>(() => {
    if (!value) return null;
    return options.find((opt) => opt.value === value) ?? null;
  }, [options, value]);

  return (
    <Autocomplete
      size={size}
      options={fullOptions}
      value={selectedOption}
      onChange={(_, newValue) => {
        onChange(newValue?.value ?? "");
      }}
      getOptionLabel={(opt) => opt.label}
      isOptionEqualToValue={(opt, val) => opt.value === val.value}
      placeholder={allOptionLabel || placeholder}
      openOnFocus
      clearOnBlur={false}
      disabled={disabled}
      className={className}
      sx={[
        {
          "& input::placeholder": {
            color: "inherit",
            opacity: 1,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      slotProps={{
        listbox: {
          sx: { maxHeight: 280 },
        },
      }}
    />
  );
};

export default SearchableSelect;
