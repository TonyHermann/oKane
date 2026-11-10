import { Importer } from "@/ui/components/importer/Importer";
import useModalContext from "@/ui/components/modal/context/useModalContext";
import Modal from "@/ui/components/modal/Modal";
import { TransactionList } from "@/ui/components/TransactionList";
import { useTranslation } from "@/ui/i18n";

export const MovementsPage = () => {
  const { openModal } = useModalContext();
  const { t } = useTranslation();

  const openImportModal = () => {
    openModal({
      title: t("movements.importModalTitle"),
      content: (
        <Modal.Body>
          <Importer />
        </Modal.Body>
      ),
    });
  };

  return (
    <>
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">{t("movements.summaryTitle")}</div>
        </div>
        <div className="window-body">
          <p>...</p>
        </div>
      </div>
      <br />
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">{t("movements.tableTitle")}</div>
        </div>
        <div className="window-body">
          <div className="actions">
            <button onClick={openImportModal} type="button">
              {t("movements.importButton")}
            </button>
          </div>

          <hr style={{ margin: "12px 0" }} />

          <TransactionList />
        </div>
      </div>
    </>
  );
};
