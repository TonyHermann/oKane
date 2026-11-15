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
import { useErrorMessage, usePlural, useTranslation } from "@/ui/i18n";
import { ApplyRulesConfirmation } from "./ApplyRulesConfirmation";
import "./CategorizationRulesPage.css";

export const CategorizationRulesPage = () => {
  const dispatch = useAppDispatch();
  const { openModal, closeModal } = useModalContext();
  const { t } = useTranslation();
  const plural = usePlural();
  const getErrorMessage = useErrorMessage();
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
        plural(
          { one: "rules.applied.one", other: "rules.applied.other" },
          result.payload.length,
        ),
      );
    }
  };

  const handleApplyAll = async () => {
    const result = await dispatch(previewCategorizationRules());

    if (!previewCategorizationRules.fulfilled.match(result)) return;

    openModal({
      title: t("rules.applyModalTitle"),
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
        <div className="title-bar-text">{t("rules.adminTitle")}</div>
      </div>
      <div className="window-body">
        <p>{t("rules.description")}</p>
        <form className="categorization-rules-form" onSubmit={handleSubmit}>
          <label htmlFor="rule-descriptions">
            {t("rules.descriptionsLabel")}
          </label>
           <select
             id="rule-descriptions"
             value={selectedDescription}
             onChange={handleDescriptionChange}
           >
             <option value="">{t("rules.selectDescription")}</option>
             {availableDescriptions.map((description) => (
               <option key={description} value={description}>
                 {description}
               </option>
             ))}
           </select>
           {selectedDescriptions.length > 0 && (
             <div
               className="categorization-rules-selected-descriptions"
               aria-label={t("rules.selectedDescriptionsAria")}
             >
               {selectedDescriptions.map((description) => (
                 <span className="categorization-rules-description-tag" key={description}>
                   <span>{description}</span>
                   <button
                     type="button"
                     aria-label={t("rules.removeDescriptionAria", {
                       description,
                     })}
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
          <label htmlFor="rule-category">{t("rules.categoryLabel")}</label>
          <select
            id="rule-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">{t("rules.selectCategory")}</option>
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
              {t("rules.addButton")}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleApplyAll}
            >
              {t("rules.applyButton")}
            </button>
          </div>
        </form>

        {appliedMessage && <p className="categorization-rules-applied">{appliedMessage}</p>}
        {error && <p role="alert">{getErrorMessage(error)}</p>}
        {rules.length === 0 ? (
          <p>{t("rules.empty")}</p>
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
                  {t("common.remove")}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};
