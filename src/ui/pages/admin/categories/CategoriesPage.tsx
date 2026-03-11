// src/ui/pages/admin/categories/CategoriesPage.tsx
import { useState, useEffect } from "react";
import { CategoryActions } from "../../../../adapters/CategoryActions";
import { Category } from "../../../../core/entities/Category";

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const result = await CategoryActions.getAll;
      setCategories(result);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="window" style={{ padding: "0" }}>
      <div className="title-bar">
        <div className="title-bar-text">Administrador de Categorías</div>
      </div>
      <div className="window-body">
        <div style={{ marginBottom: "12px" }}></div>

        <div
          className="modal-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <button type="button">Añadir una categoría</button>
        </div>

        <hr style={{ margin: "12px 0" }} />

        <div className="container" style={{ maxHeight: "300px", overflow: "auto" }}>
          <p>Categorías:</p>
          {categories.length === 0 ? (
            <p style={{ color: "#666" }}>No hay categorías disponibles.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {categories.map((category) => (
                <li
                  key={category.id}
                  style={{
                    marginBottom: "8px",
                    borderBottom: "1px solid #ccc",
                    paddingBottom: "8px",
                  }}
                >
                  <span>{category.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
