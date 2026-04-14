import { useRef, useState, type ReactNode } from "react";
import "./FileDropZone.css";
// import { FileValidator } from "@/core/services/FileValidator";
import { useDragging } from "@/ui/hooks/useDragging";

type Props = {
  onFileDrop: (files: FileList | File) => void;
  children?: ReactNode;
};

export const FileDropZone = (props: Props) => {
  const [error, setError] = useState<Error | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { onFileDrop, children } = props;
  // const { isValid } = FileValidator;

  const isDragging = useDragging({
    elementRef,
    inputRef,
    onDropCB: onFileDrop,
  });

  return (
    <div className="FileDropZone__container">
      <div
        className={`dropZone ${isDragging ? "dropZone--active" : ""}`}
        data-testid="dropzone"
        ref={elementRef}
      >
        <p>¡Dropea un archivo aquí!</p>
        <p className="FileDropZone__hint">o haz clic para seleccionar</p>
      </div>
      {error && <div className="FileDropZone__error">{error.message}</div>}
      <input type="file" ref={inputRef} />
      {children}
    </div>
  );
};
