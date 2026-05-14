import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import "./FileDropZone.css";
import { FileValidator } from "@/core/services/FileValidator";
import { useDragging } from "@/ui/hooks/useDragging";

type Props = {
  onFileDrop: (files: File | Array<File>) => void;
  onFileSelect: (files: File | Array<File>) => void;
  handleChange: (files: File | Array<File>) => void;
  maxFileSize?: number;
  validFileTypes?: string[];
  children?: ReactNode;
};

export const FileDropZone = ({
  onFileDrop,
  onFileSelect,
  handleChange,
  maxFileSize,
  validFileTypes,
  children,
}: Props) => {
  const [error, setError] = useState<Error | null>(null);
  const [fileOrFiles, setFiles] = useState<File | Array<File> | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isValidType, isValidSize } = FileValidator;

  const validateFile = (file: File): boolean => {
    if (maxFileSize && !isValidSize(maxFileSize, file)) {
      setError(
        new Error("El archivo que has ingresado, supera el límite de peso."),
      );
      return false;
    }
    if (validFileTypes && !isValidType(validFileTypes, file)) {
      setError(
        new Error("El archivo que has ingresado, no es de un tipo válido."),
      );
      return false;
    }
    setError(null);
    return true;
  };

  const handleChanges = (files: File | Array<File>): boolean => {
    let checkError = false;
    if (files) {
      if (files instanceof File) {
        checkError = !validateFile(files);
      } else {
        files.forEach((file) => {
          checkError = !validateFile(file) || checkError;
        });
      }
    }
    if (checkError) return false;
    handleChange(files);
    setFiles(files);
    setError(null);
    return true;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line prefer-destructuring
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;
    const toPass = files.length > 1 ? Array.from(files) : files[0];
    const success = handleChanges(toPass);
    if (success) {
      onFileSelect(toPass);
    }
  };

  const isDragging = useDragging({
    elementRef,
    inputRef,
    onDropCB: onFileDrop,
    handleChanges,
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
      {fileOrFiles && (
        <div className="FileDropZone__files">
          {fileOrFiles instanceof Array
            ? fileOrFiles.map((file) => file.name)
            : fileOrFiles.name}
        </div>
      )}
      <input type="file" ref={inputRef} onChange={handleInputChange} />
      {children}
    </div>
  );
};
