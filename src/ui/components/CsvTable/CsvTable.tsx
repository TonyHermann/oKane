import { useRef } from "react";
import type { ICsvRow } from "@/core/services/ICsvParser";
import { Table } from "../Table/Table";

interface CsvTableProps {
  headers: ICsvRow;
  rows: ICsvRow[];
  onSelectionChange: (rows: ICsvRow[] | null) => void;
}
export const CsvTable = ({
  headers,
  rows,
  onSelectionChange,
}: CsvTableProps) => {
  const rowIds = useRef(new WeakMap<object, string>());
  const nextRowId = useRef(0);

  const getRowId = (row: ICsvRow) => {
    const existingId = rowIds.current.get(row);
    if (existingId) return existingId;

    const id = `csv-row-${nextRowId.current}`;
    nextRowId.current += 1;
    rowIds.current.set(row, id);
    return id;
  };

  return (
    <Table
      rows={rows}
      getRowId={getRowId}
      onSelectionChange={onSelectionChange}
    >
      <Table.Header>
        <Table.SelectColumn />
        {Object.keys(headers).map((column) => (
          <th key={column}>{column}</th>
        ))}
      </Table.Header>
      <Table.Body>
          {(row: ICsvRow, index: number) => (
            <tr key={getRowId(row)}>
              <Table.SelectRow row={row} index={index} />

              {Object.entries(row as object).map(([column, value]) => (
                <td key={column}>{String(value)}</td>
              ))}
            </tr>
          )}
      </Table.Body>
      <Table.Footer>{rows.length} rows.</Table.Footer>
    </Table>
  );
};
