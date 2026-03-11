import { useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import useModalContext from "./context/useModalContext";
import useRestoreFocus from "./hooks/useRestoreFocus";
import useLockBodyScroll from "./hooks/useLockBodyScroll";
import useFocusTrap from "./hooks/useFocusTrap";

interface ModalProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
}

const Modal = ({ title, children, onClose }: ModalProps) => {
  const { state, setState } = useModalContext();
  const modalRef = useRef<HTMLDivElement>(null);
  useRestoreFocus(state);
  useLockBodyScroll(state);
  useFocusTrap(state, modalRef);

  const modalRoot = document.querySelector("#modal");

  const closeModal = useCallback(() => {
    onClose?.();
    setState(false);
  }, [setState, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    closeModal();
  };

  if (!state || !modalRoot) {
    return null;
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          closeModal();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="window modal"
        aria-modal="true"
        aria-labelledby="modal"
        tabIndex={-1}
        role="dialog"
      >
        <div className="title-bar">
          <div id="modal-title" className="title-bar-text">
            {title}
          </div>
          <div className="title-bar-controls">
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="closeBtnXP"
            />
          </div>
        </div>
        {children}
      </div>
    </div>,
    modalRoot,
  );
};

const ModalHeader = ({ children }: { children: ReactNode }) => (
  <div className="window-body">{children}</div>
);

const ModalBody = ({ children }: { children: ReactNode }) => (
  <div className="window-body">{children}</div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="window-footer">{children}</div>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
