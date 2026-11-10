import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import { usePlural, useTranslation } from "@/ui/i18n";
import "./Table.css";
import {
  TableProvider,
  useTableContext,
  type TableVisibleRow,
} from "./TableContext";

const DEFAULT_PAGE_SIZE = 25;

type TableBodyRender<T> = (row: T, index: number) => ReactNode;

interface TableProps<T> {
  rows: T[];
  height?: number;
  children: ReactNode;
  getRowId?: (row: T, index: number) => string;
  onSelectionChange?: (rows: T[] | null) => void;
  pagination?: boolean;
  pageSize?: number;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableBodyProps<T> {
  children: ReactNode | TableBodyRender<T>;
}

interface TableFooterProps {
  children: ReactNode;
}

interface TableToolbarProps {
  children: ReactNode;
}

interface TableSelectRowProps<T> {
  row: T;
  index: number;
}

const TableHeader = ({ children }: TableHeaderProps) => {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
};

const TableBody = <T,>({ children }: TableBodyProps<T>) => {
  const { visibleRows } = useTableContext<T>();

  if (typeof children === "function") {
    return (
      <tbody>
        {visibleRows.map(({ row, index }) => children(row, index))}
      </tbody>
    );
  }

  return (
    <tbody>
      {children}
    </tbody>
  );
};

const TableFooter = <T,>({ children }: TableFooterProps) => {
  const { selectedRows } = useTableContext<T>();
  const plural = usePlural();

  return (
    <tfoot>
      <tr>
        <td>{children}</td>
        <td>
          {plural(
            { one: "table.selected.one", other: "table.selected.other" },
            selectedRows.length,
          )}
        </td>
      </tr>
    </tfoot>
  );
};

const TableToolbar = ({ children }: TableToolbarProps) => {
  return <div className="table-toolbar">{children}</div>;
};

const TableSelectRow = <T,>({ row, index }: TableSelectRowProps<T>) => {
  const { isSelected, toggleRow, getRowId, tableId } = useTableContext<T>();
  const { t } = useTranslation();

  const id = getRowId(row, index);

  return (
    <td>
      <div className="field-row">
        <input
          type="checkbox"
          checked={isSelected(row, index)}
          id={`${tableId}_select_${id}`}
          aria-label={t("table.selectRow")}
          onChange={() => toggleRow(row, index)}
        />
        <label htmlFor={`${tableId}_select_${id}`}>~</label>
      </div>
    </td>
  );
};

const TableSelectColumn = () => {
  const { allSelected, toggleAll, tableId } = useTableContext();
  const { t } = useTranslation();
  return (
    <th>
      <div className="field-row">
        <input
          type="checkbox"
          checked={allSelected}
          id={`${tableId}_select_all`}
          aria-label={t("table.selectAll")}
          onChange={() => toggleAll()}
        />
        <label htmlFor={`${tableId}_select_all`}>~</label>
      </div>
    </th>
  );
};

const getElement = (
  children: ReactNode,
  type: ElementType,
): ReactElement | null => {
  const elements = Children.toArray(children);
  const element = elements.find((el) => {
    return isValidElement(el) && el.type === type;
  });

  return isValidElement(element) ? element : null;
};

export const Table = <T,>({
  rows,
  height = 300,
  children,
  getRowId,
  onSelectionChange,
  pagination = false,
  pageSize,
}: TableProps<T>) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const generatedRowIds = useRef(new WeakMap<object, string>());
  const nextGeneratedRowId = useRef(0);

  const tableId = useId();
  const { t } = useTranslation();

  const normalizedPageSize =
    pageSize !== undefined && Number.isFinite(pageSize) && pageSize > 0
      ? Math.floor(pageSize)
      : DEFAULT_PAGE_SIZE;

  // Keep this boundary separate so sorting can be inserted before pagination later.
  const transformedRows = useMemo<TableVisibleRow<T>[]>(
    () => rows.map((row, index) => ({ row, index })),
    [rows],
  );

  const pageCount = pagination
    ? Math.max(1, Math.ceil(transformedRows.length / normalizedPageSize))
    : 1;
  const activePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    if (page !== activePage) setPage(activePage);
  }, [activePage, page]);

  const visibleRows = useMemo(() => {
    if (!pagination) return transformedRows;
    const start = activePage * normalizedPageSize;
    return transformedRows.slice(start, start + normalizedPageSize);
  }, [activePage, normalizedPageSize, pagination, transformedRows]);

  const resolveRowId = useCallback(
    (row: T, index: number) => {
      if (getRowId) return getRowId(row, index);
      if (typeof row === "object" && row !== null) {
        const objectRow = row as object;
        const existingId = generatedRowIds.current.get(objectRow);
        if (existingId) return existingId;

        const id = `table-row-${nextGeneratedRowId.current}`;
        nextGeneratedRowId.current += 1;
        generatedRowIds.current.set(objectRow, id);
        return id;
      }

      return String(index);
    },
    [getRowId],
  );

  const getId = useCallback(
    (row: T, index = rows.indexOf(row)) => resolveRowId(row, index),
    [resolveRowId, rows],
  );

  const selectedRows = useMemo(() => {
    return rows.filter((row, index) => selectedIds.has(getId(row, index)));
  }, [getId, selectedIds, rows]);

  const toggleRow = useCallback(
    (row: T, index?: number) => {
      const id = getId(row, index);

      const next = new Set(selectedIds);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      setSelectedIds(next);

      const nextRows = rows.filter((_row, rowIndex) =>
        next.has(getId(_row, rowIndex)),
      );

      onSelectionChange?.(nextRows);
    },
    [getId, rows, selectedIds, onSelectionChange],
  );

  const toggleAll = useCallback(() => {
    const visibleIds = visibleRows.map(({ row, index }) => getId(row, index));
    const visibleRowsSelected = visibleIds.every((id) => selectedIds.has(id));
    const next = new Set(selectedIds);

    visibleIds.forEach((id) => {
      if (visibleRowsSelected) {
        next.delete(id);
      } else {
        next.add(id);
      }
    });

    setSelectedIds(next);

    const nextRows = rows.filter((row, index) => next.has(getId(row, index)));

    onSelectionChange?.(nextRows);
  }, [selectedIds, rows, getId, onSelectionChange, visibleRows]);

  const isSelected = useCallback(
    (row: T, index?: number) => selectedIds.has(getId(row, index)),
    [selectedIds, getId],
  );

  const allSelected = useMemo(() => {
    return (
      visibleRows.length > 0 &&
      visibleRows.every(({ row, index }) => selectedIds.has(getId(row, index)))
    );
  }, [getId, selectedIds, visibleRows]);

  const contextValue = useMemo(
    () => ({
      rows,
      visibleRows,
      toggleRow,
      selectedRows,
      getRowId: resolveRowId,
      isSelected,
      allSelected,
      toggleAll,
      tableId,
    }),
    [
      rows,
      visibleRows,
      toggleRow,
      selectedRows,
      resolveRowId,
      isSelected,
      allSelected,
      toggleAll,
      tableId,
    ],
  );

  const header = getElement(children, TableHeader);
  const body = getElement(children, TableBody);
  const footer = getElement(children, TableFooter);
  const toolbar = getElement(children, TableToolbar);

  const paginationControls = pagination ? (
    <nav
      className="table-pagination"
      aria-label={t("table.pagination.label")}
    >
      <button
        type="button"
        onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
        disabled={activePage === 0}
        aria-label={t("table.pagination.previous")}
      >
        {t("table.pagination.previousText")}
      </button>
      <span aria-live="polite">
        {t("table.pagination.page", {
          page: activePage + 1,
          pageCount,
        })}
      </span>
      <button
        type="button"
        onClick={() =>
          setPage((currentPage) => Math.min(pageCount - 1, currentPage + 1))
        }
        disabled={activePage === pageCount - 1}
        aria-label={t("table.pagination.next")}
      >
        {t("table.pagination.nextText")}
      </button>
    </nav>
  ) : null;

  return (
    <TableProvider value={contextValue}>
      <div
        className="table-container"
        style={{
          maxHeight: height,
        }}
      >
        {toolbar}
        <div className="table-scroll">
          <table>
            {header}
            {body}
            {footer}
          </table>
        </div>
        {paginationControls}
      </div>
    </TableProvider>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Toolbar = TableToolbar;
Table.SelectRow = TableSelectRow;
Table.SelectColumn = TableSelectColumn;
