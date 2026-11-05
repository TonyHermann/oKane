import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/ui/store/hooks";
import useModalContext from "@/ui/components/modal/context/useModalContext";
import { loadCategories } from "@/ui/store/slices/categorySlices";
import {
  applyAllCategorizationRules,
  loadCategorizationRules,
  previewCategorizationRules,
  removeCategorizationRule,
  saveCategorizationRule,
} from "@/ui/store/slices/categorizationRulesSlices";
import { loadTransactions } from "@/ui/store/slices/transactionsSlices";
import { ApplyRulesConfirmation } from "./ApplyRulesConfirmation";
import "./CategorizationRulesPage.css";

export const CategorizationRulesPage = () => {
  const dispatch = useAppDispatch();
  const { openModal, closeModal } = useModalContext();
  const categories = useAppSelector((state) => state.categories.items);
  const transactions = useAppSelector((state) => state.transactions.items);
  const { items: rules, loading, error } = useAppSelector(
    (state) => state.categorizationRules,
  );
  const [selectedDescriptions, setSelectedDescriptions] = useState<string[]>(
    [],
  );
  const [selectedDescription, setSelectedDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [appliedMessage, setAppliedMessage] = useState("");

  useEffect(() => {
    dispatch(loadCategories());
    dispatch(loadCategorizationRules());
    dispatch(loadTransactions());
  }, [dispatch]);

  const descriptions = Array.from(
    new Set(transactions.map((transaction) => transaction.description)),
  ).sort();
  const availableDescriptions = descriptions.filter(
    (description) => !selectedDescriptions.includes(description),
  );

  const handleDescriptionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const description = event.currentTarget.value;
    if (!description) return;

    setSelectedDescriptions((currentDescriptions) =>
      currentDescriptions.includes(description)
        ? currentDescriptions
        : [...currentDescriptions, description],
    );
    setSelectedDescription("");
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (selectedDescriptions.length === 0 || !categoryId) return;

    await dispatch(
      saveCategorizationRule({
        conditionValues: selectedDescriptions,
        categoryId,
      }),
    ).unwrap();
    setSelectedDescriptions([]);
  };

  const handleConfirmApply = async () => {
    closeModal();

    const result = await dispatch(applyAllCategorizationRules());

    if (applyAllCategorizationRules.fulfilled.match(result)) {
      setAppliedMessage(
        `Se actualizaron ${result.payload.length} transacciones.`,
      );
    }
  };

  const handleApplyAll = async () => {
    const result = await dispatch(previewCategorizationRules());

    if (!previewCategorizationRules.fulfilled.match(result)) return;

    openModal({
      title: "Aplicar reglas de categorización",
      content: (
        <ApplyRulesConfirmation
          preview={result.payload}
          onCancel={closeModal}
          onConfirm={handleConfirmApply}
        />
      ),
    });
  };

  return (
    <div className="window categorization-rules-page">
      <div className="title-bar">
        <div className="title-bar-text">Administrador de Rules</div>
      </div>
      <div className="window-body">
        <p>Las rules se aplican en orden. Si coinciden varias, gana la primera.</p>
        <form className="categorization-rules-form" onSubmit={handleSubmit}>
          <label htmlFor="rule-descriptions">Descripciones</label>
           <select
             id="rule-descriptions"
             value={selectedDescription}
             onChange={handleDescriptionChange}
           >
             <option value="">Seleccioná una descripción</option>
             {availableDescriptions.map((description) => (
               <option key={description} value={description}>
                 {description}
               </option>
             ))}
           </select>
           {selectedDescriptions.length > 0 && (
             <div
               className="categorization-rules-selected-descriptions"
               aria-label="Descripciones seleccionadas"
             >
               {selectedDescriptions.map((description) => (
                 <span className="categorization-rules-description-tag" key={description}>
                   <span>{description}</span>
                   <button
                     type="button"
                     aria-label={`Quitar descripción ${description}`}
                     onClick={() =>
                       setSelectedDescriptions((currentDescriptions) =>
                         currentDescriptions.filter((item) => item !== description),
                       )
                     }
                   >
                     ×
                   </button>
                 </span>
               ))}
             </div>
           )}
          <label htmlFor="rule-category">Categoría</label>
          <select
            id="rule-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Seleccioná una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="categorization-rules-actions">
            <button
              type="submit"
              disabled={
                loading || selectedDescriptions.length === 0 || !categoryId
              }
            >
              Añadir rule
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleApplyAll}
            >
              Aplicar reglas
            </button>
          </div>
        </form>

        {appliedMessage && <p className="categorization-rules-applied">{appliedMessage}</p>}
        {error && <p role="alert">{error}</p>}
        {rules.length === 0 ? (
          <p>No hay rules registradas.</p>
        ) : (
          <ol className="categorization-rules-list">
            {rules.map((rule) => (
              <li key={rule.id}>
                <span>
                  {rule.conditionValues.join(", ")} → {rule.category.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(removeCategorizationRule(rule.id));
                  }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};
