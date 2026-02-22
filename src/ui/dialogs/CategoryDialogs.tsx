import React, { useState, useEffect, useCallback } from "react";
import { CategoryActions } from "../../adapters/CategoryActions";
import { Category } from "../../core/entities/Category";
import Modal from "../components/Modal";

// ============================================
// Manage Category Modal (Add/Edit)
// ============================================
interface ManageCategoryModalProps {
  isOpen: boolean;
  onSave: () => void;
  onClose: () => void;
  categoryName?: string;
  categories?: Category[];
}

export const ManageCategoryModal: React.FC<ManageCategoryModalProps> = ({
  isOpen,
  onSave,
  onClose,
  categoryName,
  categories = [],
}) => {
  const [name, setName] = useState(categoryName || "");
  const [isLoading, setIsLoading] = useState(false);

  // Load existing category data when editing
  useEffect(() => {
    if (isOpen) {
      const initialName = categoryName || "";
      setName(initialName);
    }
  }, [isOpen, categoryName]);

  const handleSave = async () => {
    const nameToSave = categoryName || name;

    if (!nameToSave.trim()) {
      // alert("El nombre de la categoría no puede estar vacío.");
      return;
    }

    setIsLoading(true);
    try {
      const categoryToSave = new Category(
        editingCategory?.id || crypto.randomUUID(),
        nameToSave.trim(),
        editingCategory?.created_at || new Date(),
      );

      if (categoryName) {
        const updateFn = await CategoryActions.update;
        await updateFn(categoryToSave);
      } else {
        const saveFn = await CategoryActions.save;
        await saveFn(categoryToSave);
      }

      onSave();
    } catch (error: unknown) {
      // console.error("Error saving category:", error);
      // alert("Error al guardar la categoría.");
    } finally {
      setIsLoading(false);
    }
  };

  const editingCategory = categoryName ? categories.find((cat) => cat.name === categoryName) : undefined;

  if (!isOpen) return null;

  const title = categoryName ? "Actualizar categoría" : "Añadir una categoría";

  return (
    <Modal title={title}>
      <div style={{ marginBottom: "12px" }}>
        <p>
          <strong>Nombre de la categoría</strong>
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Escribe el nombre de la categoría"
          disabled={!!categoryName}
          required
          style={{ width: "100%" }}
        />
      </div>

      <div className="modal-actions" style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button type="button" onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar categoría"}
        </button>
        <button type="button" disabled={isLoading}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

// ============================================
// Ask Category Name Modal (Prompt)
// ============================================
interface AskCategoryNameModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const AskCategoryNameModal: React.FC<AskCategoryNameModalProps> = ({ isOpen, title, onConfirm, onCancel }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onConfirm(trimmedValue);
    } else {
      // alert("El campo no debe estar vacío.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Ingresa el nombre de la categoría">
      <div style={{ marginBottom: "12px" }}>
        <p>
          <strong>{title}</strong>
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Comida rápida"
          required
          style={{ width: "100%" }}
        />
      </div>

      <hr style={{ margin: "12px 0" }} />

      <div className="modal-actions" style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button type="button" onClick={handleConfirm}>
          Confirmar
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

// ============================================
// Category Manager Modal (Main Admin)
// ============================================
interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAskNameModal, setShowAskNameModal] = useState(false);
  const [askNameTitle, setAskNameTitle] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState<string | undefined>(undefined);

  // Fetch categories
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await CategoryActions.getAll;
      setCategories(result);
    } catch (error: unknown) {
      // console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  // Handle add category
  const handleAddCategory = () => {
    setEditingCategoryName(undefined);
    setShowManageModal(true);
  };

  // Handle update category
  const handleUpdateCategoryClick = () => {
    setAskNameTitle("Categoría a actualizar:");
    setShowAskNameModal(true);
  };

  // Handle delete category
  const handleDeleteCategoryClick = () => {
    setAskNameTitle("Categoría a eliminar:");
    setShowAskNameModal(true);
  };

  // Handle ask name confirm
  const handleAskNameConfirm = async (name: string) => {
    setShowAskNameModal(false);

    if (!name.trim()) {
      // alert("No has ingresado un nombre de categoría.");
      return;
    }

    if (askNameTitle === "Categoría a actualizar:") {
      setEditingCategoryName(name);
      setShowManageModal(true);
    } else if (askNameTitle === "Categoría a eliminar:") {
      try {
        const deleteFn = await CategoryActions.delete;
        await deleteFn(name);
        await loadCategories();
      } catch (error: unknown) {
        // console.error("Error deleting category:", error);
        // alert("Error al eliminar la categoría.");
      }
    }
  };

  // Handle category actions from list
  const handleCategoryAction = async (categoryName: string, action: "update" | "delete") => {
    if (action === "delete") {
      try {
        const deleteFn = await CategoryActions.delete;
        await deleteFn(categoryName);
        await loadCategories();
      } catch (error: unknown) {
        // console.error("Error deleting category:", error);
        // alert("Error al eliminar la categoría.");
      }
    } else if (action === "update") {
      setEditingCategoryName(categoryName);
      setShowManageModal(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal title="Administrador de categorías" isOpen onClose={onClose}>
        <div style={{ marginBottom: "12px" }}>
          <p>Administrador de categorías</p>
        </div>

        <div
          className="modal-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <button type="button" onClick={loadCategories} disabled={isLoading}>
            {isLoading ? "Actualizando..." : "Actualizar lista"}
          </button>
          <button type="button" onClick={handleAddCategory}>
            Añadir una categoría
          </button>
          <button type="button" onClick={handleUpdateCategoryClick}>
            Actualizar una categoría
          </button>
          <button type="button" onClick={handleDeleteCategoryClick}>
            Eliminar una categoría
          </button>
        </div>

        <hr style={{ margin: "12px 0" }} />

        <div className="container category-container" style={{ maxHeight: "300px", overflow: "auto" }}>
          <p>Categorías:</p>
          {categories.length === 0 ? (
            <p style={{ color: "#666" }}>No hay categorías disponibles.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {categories.map((category) => (
                <li
                  key={category.id}
                  id={`cat_${category.name}`}
                  style={{
                    marginBottom: "8px",
                    borderBottom: "1px solid #ccc",
                    paddingBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{category.name}</span>
                    <div className="category-buttons" style={{ display: "flex", gap: "8px" }}>
                      <button
                        data-action="update"
                        data-cat={category.name}
                        onClick={() => handleCategoryAction(category.name, "update")}
                        style={{ cursor: "pointer" }}
                        title="Actualizar"
                        type="button"
                      >
                        ✏️
                      </button>
                      <button
                        data-action="delete"
                        data-cat={category.name}
                        onClick={() => handleCategoryAction(category.name, "delete")}
                        style={{ cursor: "pointer" }}
                        title="Eliminar"
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="modal-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "12px",
          }}
        >
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </Modal>

      {/* Manage Category Modal */}
      <ManageCategoryModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        onSave={loadCategories}
        categoryName={editingCategoryName}
        categories={categories}
      />

      {/* Ask Category Name Modal */}
      <AskCategoryNameModal
        isOpen={showAskNameModal}
        title={askNameTitle}
        onConfirm={handleAskNameConfirm}
        onCancel={() => setShowAskNameModal(false)}
      />
    </>
  );
};

export default CategoryManagerModal;
