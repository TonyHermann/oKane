import { useEffect } from "react";
import { Spinner } from "../Spinner";
import { Table } from "../Table/Table";
import { Button } from "../Button/Button";
import { EditIcon } from "../Icons/EditIcon";
import { RemoveIcon } from "../Icons/RemoveIcon";
import { useAppDispatch, useAppSelector } from "@/ui/store/hooks";
import { useErrorMessage, usePlural, useTranslation } from "@/ui/i18n";
import {
  loadCategories,
  removeCategory,
  type CategoryState,
} from "@/ui/store/slices/categorySlices";

interface CategoryRowProps {
  row: CategoryState;
  index: number;
  onEdit: (category: CategoryState) => void;
  onRemove: (id: string) => void;
}

const CategoryRow = ({ row, index, onEdit, onRemove }: CategoryRowProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Table.SelectRow row={row} index={index} />
      <td>{row.id}</td>
      <td>{row.name}</td>
      <td>
        <div className="rowActions-container">
          <Button
            variant="icon"
            size="sm"
            icon={<EditIcon />}
            label={t("common.edit")}
            onClick={() => onEdit(row)}
          />
          <Button
            variant="icon"
            size="sm"
            icon={<RemoveIcon />}
            label={t("common.remove")}
            onClick={() => onRemove(row.id)}
          />
        </div>
      </td>
    </>
  );
};

interface CategoryListProps {
  onEdit: (category: CategoryState) => void;
}

const CategoryList = ({ onEdit }: CategoryListProps) => {
  const { t } = useTranslation();
  const plural = usePlural();
  const categories = useAppSelector((state) => state.categories.items);
  const loading = useAppSelector((state) => state.categories.loading);
  const error = useAppSelector((state) => state.categories.error);
  const getErrorMessage = useErrorMessage();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadCategories());
  }, [dispatch]);

  const handleRemove = (id: string) => {
    dispatch(removeCategory(id));
  };

  if (loading) {
    return (
      <div>
        <Spinner size={32} label={t("categories.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>{getErrorMessage(error)}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <section>
        <p>{t("categories.empty")}</p>
      </section>
    );
  }

  return (
    <div className="container" style={{ maxHeight: "300px", overflow: "auto" }}>
      <Table rows={categories} getRowId={(row) => row.id}>
        <Table.Header>
          <Table.SelectColumn />
          <th>{t("categories.header.id")}</th>
          <th>{t("categories.header.name")}</th>
          <th>{t("categories.header.actions")}</th>
        </Table.Header>
        <Table.Body>
          {(row: CategoryState, index: number) => (
            <tr key={row.id}>
              <CategoryRow
                row={row}
                index={index}
                onEdit={onEdit}
                onRemove={handleRemove}
              />
            </tr>
          )}
        </Table.Body>
        <Table.Footer>
          {plural(
            { one: "common.rows.one", other: "common.rows.other" },
            categories.length,
          )}
        </Table.Footer>
      </Table>
    </div>
  );
};

export default CategoryList;
