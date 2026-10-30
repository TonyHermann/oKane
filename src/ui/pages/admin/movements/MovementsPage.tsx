import { Importer } from "@/ui/components/importer/Importer";
import useModalContext from "@/ui/components/modal/context/useModalContext";
import Modal from "@/ui/components/modal/Modal";
import { TransactionList } from "@/ui/components/TransactionList";

export const MovementsPage = () => {
  const { openModal } = useModalContext();

  const openImportModal = () => {
    openModal({
      title: "Importar transacciones",
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
          <div className="title-bar-text">Información general</div>
        </div>
        <div className="window-body">
          <p>...</p>
        </div>
      </div>
      <br />
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">Tabla de transacciones</div>
        </div>
        <div className="window-body">
          <div className="actions">
            <button onClick={openImportModal} type="button">
              Importar transacciones
            </button>
          </div>

          <hr style={{ margin: "12px 0" }} />

          <TransactionList />
        </div>
      </div>
    </>
  );
};
