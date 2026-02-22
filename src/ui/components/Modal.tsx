import { createPortal } from "react-dom";

interface ModalProps {
  title: string;
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const Modal = ({ title, children, isOpen = false, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return createPortal(
    <>
      <div
        className="modal-overlay"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />
      <div className="window modal" role="dialog" aria-labelledby="modal-title">
        <div className="title-bar">
          <div id="modal-title" className="title-bar-text">
            {title}
          </div>
          <div className="title-bar-controls">
            <button
              type="button"
              aria-label="Close"
              onClick={() => onClose?.()}
              className="closeBtnXP"
            />
          </div>
        </div>
        <div className="window-body">{children}</div>
      </div>
    </>,
    document.body,
  );
};
export default Modal;
