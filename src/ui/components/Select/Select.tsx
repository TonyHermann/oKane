import type { ChangeEvent } from "react";

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
        <option value="">Selecciona una categoría</option>
        {options.map((opt) => {
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>

      {error && <p id={errorId}>{error[0]}</p>}
    </>
  );
};
