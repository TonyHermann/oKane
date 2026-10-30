import { useCallback, useEffect, useState, type RefObject } from "react";

type Props = {
  elementRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  handleChanges: (files: File | Array<File>) => boolean;
  onDropCB: (files: File | Array<File>) => void;
};

export const useDragging = (props: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const { elementRef, inputRef, onDropCB, handleChanges } = props;

  const handleClick = useCallback(() => {
    inputRef?.current?.click();
  }, [inputRef]);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const eventFiles = e.dataTransfer?.files;
      if (eventFiles && eventFiles.length > 0) {
        let success = false;
        let toTestFiles;
        if (eventFiles.length > 1) {
          toTestFiles = Array.from(eventFiles);
        } else {
          [toTestFiles] = eventFiles;
        }
        success = handleChanges(toTestFiles);
        if (success) {
          onDropCB(toTestFiles);
        }
      }
    },
    [onDropCB, handleChanges],
  );

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.items && e.dataTransfer.items.length !== 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const element = elementRef?.current;

    if (element) {
      element.addEventListener("click", handleClick);
      element.addEventListener("dragenter", handleDragEnter);
      element.addEventListener("dragleave", handleDragLeave);
      element.addEventListener("dragover", handleDrag);
      element.addEventListener("drop", handleDrop);
    }

    return () => {
      if (element) {
        element.removeEventListener("click", handleClick);
        element.removeEventListener("dragenter", handleDragEnter);
        element.removeEventListener("dragleave", handleDragLeave);
        element.removeEventListener("dragover", handleDrag);
        element.removeEventListener("drop", handleDrop);
      }
    };
  }, [
    handleClick,
    handleDragEnter,
    handleDragLeave,
    handleDrag,
    handleDrop,
    elementRef,
  ]);

  return isDragging;
};
