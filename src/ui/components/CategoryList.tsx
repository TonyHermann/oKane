import { useState, useEffect } from "react";
import { CategoryActions } from "../../adapters/CategoryActions";
import { Category } from "../../core/entities/Category";

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoryActions.getAll;
        setCategories(response);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">Cargando Categorías...</div>
        </div>
        <div className="window-body">
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">Error</div>
        </div>
        <div className="window-body">
          <p style={{ color: "red" }}>Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">Lista de Categorías</div>
      </div>
      <div className="window-body">
        {categories.length === 0 ? (
          <p>No hay categorías disponibles.</p>
        ) : (
          <div className="scrollable-area">
            <table className="list-box" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
