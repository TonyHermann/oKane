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
          Abrir modal
        </button>
        <Modal title="CategoryList">
          <Modal.Body>
            <CategoryList />
          </Modal.Body>
        </Modal>
      </div>
      <div className="panel"></div>
      <div className="panel"></div>
      <div className="panel"></div>
      <div className="panel"></div>
      <div className="panel"></div>
      <div className="panel"></div>
      <div className="panel"></div>
      <div className="panel"></div>
    </div>
  );
};
