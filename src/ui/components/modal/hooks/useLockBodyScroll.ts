import { useEffect } from "react";

const useLockBodyScroll = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return () => {};

    if (typeof window === "undefined" || typeof document === "undefined")
      return () => {};

    const scrollBarWidth =
      window.innerWidth > document.documentElement.clientWidth
        ? window.innerWidth - document.documentElement.clientWidth
        : 0;

    const originalOverflow = document.body.style.overflow;
    const originalPadding = document.body.style.paddingRight || "";

    document.body.style.overflow = "hidden";
    if (scrollBarWidth) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadding;
    };
  }, [locked]);
};

export default useLockBodyScroll;
