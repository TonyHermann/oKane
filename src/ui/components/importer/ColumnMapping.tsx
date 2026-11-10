import type { ChangeEvent } from "react";

export type RequiredColumn =
  | "dateColumn"
  | "amountColumn"
  | "descriptionColumn";

export type ColumnMappingValue = Record<RequiredColumn, string>;

interface ColumnMappingProps {
  requiredColumns: readonly RequiredColumn[];
  availableColumns: readonly string[];
  mapping: ColumnMappingValue;
  onChange: (mapping: ColumnMappingValue) => void;
}

interface HandleChangeProps {
  requiredColumn: string;
  event: ChangeEvent<HTMLSelectElement>;
}

// TODO: [import-column-mapping] Style the mapping block and reject two required fields mapped to the same CSV column.
export const ColumnMapping = ({
  requiredColumns,
  availableColumns,
  mapping,
  onChange,
}: ColumnMappingProps) => {
  const handleChange = ({ requiredColumn, event }: HandleChangeProps) => {
    onChange({
      ...mapping,
      [requiredColumn]: event.target.value,
    });
  };

  return (
    <section>
      <h4>Mapeo de columnas</h4>
      <div className="mapping_container">
        {requiredColumns.map((requiredColumn) => (
          <div key={requiredColumn}>
            <label htmlFor={`mapping-${requiredColumn}`}>
              {requiredColumn}
            </label>

            <select
              id={`mapping-${requiredColumn}`}
              value={mapping[requiredColumn]}
              onChange={(event) => handleChange({ requiredColumn, event })}
            >
              <option value="">Seleccionar columna...</option>

              {availableColumns.map((availableColumn) => (
                <option key={availableColumn} value={availableColumn}>
                  {availableColumn}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
};
