import { useEffect, useRef } from "react";

const useRestoreFocus = (active: boolean) => {
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
    } else {
      lastFocusedElement.current?.focus();
    }
  }, [active]);
};

export default useRestoreFocus;
