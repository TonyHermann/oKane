import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/ui/i18n";
import { Table } from "./Table";

interface TestRow {
  id: string;
  label: string;
}

const rows: TestRow[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gamma" },
  { id: "d", label: "Delta" },
  { id: "e", label: "Epsilon" },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

const renderTable = (
  tableRows = rows,
  onSelectionChange?: (selectedRows: TestRow[] | null) => void,
) =>
  render(
    <Table
      rows={tableRows}
      getRowId={(row) => row.id}
      onSelectionChange={onSelectionChange}
      pagination
      pageSize={2}
    >
      <Table.Header>
        <Table.SelectColumn />
        <th>Label</th>
      </Table.Header>
      <Table.Body>
        {(row: TestRow, index: number) => (
          <tr key={row.id}>
            <Table.SelectRow row={row} index={index} />
            <td>{row.label}</td>
          </tr>
        )}
      </Table.Body>
    </Table>,
    { wrapper },
  );

describe("Table", () => {
  it("renders paginated rows and disables controls at boundaries", () => {
    renderTable();

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
    expect(screen.getByRole("table").parentElement).toHaveClass("table-scroll");
    expect(screen.getByRole("navigation").parentElement).toHaveClass("table-container");
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));

    expect(screen.getByText("Gamma")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("keeps the existing children contract when pagination is not enabled", () => {
    render(
      <Table rows={rows}>
        <Table.Body>
          <tr>
            <td>All rows are rendered by the caller.</td>
          </tr>
        </Table.Body>
      </Table>,
      { wrapper },
    );

    expect(screen.getByText("All rows are rendered by the caller.")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("selects visible rows with stable IDs and clamps after rows are removed", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = renderTable(rows, onSelectionChange);
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(onSelectionChange).toHaveBeenLastCalledWith([rows[2]]);

    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(screen.getByText("Epsilon")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));

    rerender(
      <Table rows={rows.slice(0, 2)} pagination pageSize={2}>
        <Table.Body>
          {(row: TestRow, index: number) => (
            <tr key={row.id}>
              <Table.SelectRow row={row} index={index} />
              <td>{row.label}</td>
            </tr>
          )}
        </Table.Body>
      </Table>,
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
  });
});
