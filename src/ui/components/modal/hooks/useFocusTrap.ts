import { useEffect, type RefObject } from "react";

interface UseFocusTrapProps {
  isActive: boolean;
  modalRef: RefObject<HTMLDivElement | null>;
}

const useFocusTrap = (isActive, modalRef): UseFocusTrapProps => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (isActive) {
      document.addEventListener("keydown", handleKeydown);
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isActive, modalRef]);
};

export default useFocusTrap;
