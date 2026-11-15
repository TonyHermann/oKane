import CategoryList from "@/ui/components/CategoryList/CategoryList";
import useModalContext from "@/ui/components/modal/context/useModalContext";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { UpdateCategoryForm } from "./UpdateCategoryForm";
import Modal from "@/ui/components/modal/Modal";
import type { CategoryState } from "@/ui/store/slices/categorySlices";
import { useTranslation } from "@/ui/i18n";

export const CategoriesPage = () => {
  const { openModal } = useModalContext();
  const { t } = useTranslation();

  const openCreateModal = () => {
    openModal({
      title: t("categories.createModalTitle"),
      content: (
        <Modal.Body>
          <CreateCategoryForm />
        </Modal.Body>
      ),
    });
  };

  const openUpdateModal = (category: CategoryState) => {
    openModal({
      title: t("categories.editModalTitle"),
      content: (
        <Modal.Body>
          <UpdateCategoryForm category={category} />
        </Modal.Body>
      ),
    });
  };

  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">{t("categories.adminTitle")}</div>
      </div>
      <div className="window-body">
        <div
          className="actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <button type="button" onClick={openCreateModal}>
            {t("categories.addButton")}
          </button>
        </div>
        <hr style={{ margin: "12px 0" }} />
        <CategoryList onEdit={openUpdateModal} />
      </div>
    </div>
  );
};
