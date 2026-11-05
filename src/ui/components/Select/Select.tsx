import type { ChangeEvent } from "react";
import { FieldError } from "@/ui/components/FieldError/FieldError";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  value: string | null;
  disabled?: boolean;
  placeholder?: string;
  error?: string[];
  errorId?: string;
}

export const Select = ({
  id,
  name,
  label,
  options,
  onChange,
  disabled,
  value,
  placeholder,
  error,
  errorId,
}: SelectProps) => {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select
        disabled={disabled}
        name={name}
        id={id}
        value={value || ""}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>

      <FieldError id={errorId} message={error?.[0]} />
    </>
  );
};
