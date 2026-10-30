import { createContext, useContext, type ReactNode } from "react";

export interface TableColumnDefinition<T> {
  id: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  selection?: boolean;
}

export interface TableVisibleRow<T> {
  row: T;
  index: number;
}

export interface TableContextValue<T> {
  rows: T[];
  visibleRows: TableVisibleRow<T>[];
  columns?: TableColumnDefinition<T>[];
  selectedRows: T[];
  isSelected: (row: T, index?: number) => boolean;
  toggleRow: (row: T, index?: number) => void;
  toggleAll: () => void;
  allSelected: boolean;
  someSelected?: boolean;
  getRowId: (row: T, index: number) => string;
  tableId: string;
}

const TableContext = createContext<TableContextValue<unknown> | null>(null);

interface TableProviderProps<T> {
  value: TableContextValue<T>;
  children: ReactNode;
}

export const TableProvider = <T,>({
  value,
  children,
}: TableProviderProps<T>) => {
  return (
    <TableContext value={value as TableContextValue<unknown>}>
      {children}
    </TableContext>
  );
};

export const useTableContext = <T,>(): TableContextValue<T> => {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error("Table components must be rendered inside a Table.");
  }

  return context as TableContextValue<T>;
};
