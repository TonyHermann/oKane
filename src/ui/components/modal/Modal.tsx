import { useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "@/ui/i18n";
import useModalContext from "./context/useModalContext";
import useRestoreFocus from "./hooks/useRestoreFocus";
import useLockBodyScroll from "./hooks/useLockBodyScroll";
import useFocusTrap from "./hooks/useFocusTrap";
import "./modal.css";

interface ModalProps {
  onClose?: () => void;
  children?: React.ReactNode;
}

const Modal = ({ children, onClose }: ModalProps) => {
  const { modal, closeModal } = useModalContext();
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  const isOpen = modal !== null;

  useRestoreFocus(isOpen);
  useLockBodyScroll(isOpen);
  useFocusTrap(isOpen, modalRef);

  const modalRoot = document.querySelector("#modal");

  const handleCloseModal = useCallback(() => {
    onClose?.();
    closeModal();
  }, [closeModal, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (!isOpen || !modalRoot) {
    return null;
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          handleCloseModal();
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
            {modal.title}
          </div>
          <div className="title-bar-controls">
            <button
              type="button"
              aria-label={t("modal.close")}
              onClick={handleCloseModal}
              className="closeBtnXP"
            />
          </div>
        </div>
        {modal.content}
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
