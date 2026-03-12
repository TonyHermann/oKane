import { useContext } from "react";
import { ModalContext } from "./modalContext";

const useModalContext = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("Modal is being used outside it's provider");
  }

  return context;
};

export default useModalContext;
