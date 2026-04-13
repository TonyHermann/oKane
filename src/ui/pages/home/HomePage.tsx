import { Importer } from "@/ui/components/importer/Importer";
import { Spinner } from "@/ui/components/Spinner";
import useModalContext from "../../components/modal/context/useModalContext";
import Modal from "../../components/modal/Modal";
import CategoryList from "./components/CategoryList";

export const HomePage = () => {
  const { setState } = useModalContext();

  const openModal = () => {
    setState(true);
  };

  return (
    <div className="overview_father">
      <div className="panel">
        <button onClick={openModal} type="button">
          Importar transacciones
        </button>
        <Modal title="Importar transacciones">
          <Modal.Body>
            <Importer />
            <CategoryList />
          </Modal.Body>
        </Modal>
      </div>
      <div className="panel">
        <Spinner />
      </div>
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
    </div>
  );
};
