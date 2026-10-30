import { useEffect } from "react";
import { Spinner } from "../Spinner";
import { Table } from "../Table/Table";
import { Button } from "../Button/Button";
import { EditIcon } from "../Icons/EditIcon";
import { RemoveIcon } from "../Icons/RemoveIcon";
import { useAppDispatch, useAppSelector } from "@/ui/store/hooks";
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
            label="Editar"
            onClick={() => onEdit(row)}
          />
          <Button
            variant="icon"
            size="sm"
            icon={<RemoveIcon />}
            label="Eliminar"
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
  const categories = useAppSelector((state) => state.categories.items);
  const loading = useAppSelector((state) => state.categories.loading);
  const error = useAppSelector((state) => state.categories.error);
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
        <Spinner size={32} label="Cargando categorias" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <section>
        <p>No hay categorias registradas.</p>
      </section>
    );
  }

  return (
    <div className="container" style={{ maxHeight: "300px", overflow: "auto" }}>
      <Table rows={categories} getRowId={(row) => row.id}>
        <Table.Header>
          <Table.SelectColumn />
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
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
        <Table.Footer>{categories.length} rows.</Table.Footer>
      </Table>
    </div>
  );
};

export default CategoryList;
