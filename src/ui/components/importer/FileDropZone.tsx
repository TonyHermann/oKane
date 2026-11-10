import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import "./FileDropZone.css";
import { DomainError } from "@/core/errors/DomainErrors";
import { FileValidator } from "@/core/services/FileValidator";
import { useDragging } from "@/ui/hooks/useDragging";
import { useTranslation } from "@/ui/i18n";

type Props = {
  onFilesAccepted: (files: File | Array<File>) => void | Promise<void>;
  maxFileSize?: number;
  validFileTypes?: string[];
  children?: ReactNode;
};

export const FileDropZone = ({
  onFilesAccepted,
  maxFileSize,
  validFileTypes,
  children,
}: Props) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [fileOrFiles, setFiles] = useState<File | Array<File> | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isValidType, isValidSize } = FileValidator;

  const validateFile = (file: File): boolean => {
    if (maxFileSize && !isValidSize(maxFileSize, file.size)) {
      setError(t("importer.fileTooLarge"));
      return false;
    }
    if (validFileTypes && !isValidType(validFileTypes, file.type)) {
      setError(t("importer.invalidType"));
      return false;
    }
    setError(null);
    return true;
  };

  const reportError = (cause: unknown) => {
    // Domain errors carry messages that were already localized at the throw
    // site; anything else must not leak its raw message into the UI.
    setError(
      cause instanceof DomainError ? cause.message : t("importer.processError"),
    );
  };

  const handleChanges = (files: File | Array<File>) => {
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
    if (checkError) return;

    try {
      const result = onFilesAccepted(files);
      if (result instanceof Promise) {
        result.catch(reportError);
      }
    } catch (cause: unknown) {
      reportError(cause);
      return;
    }

    setFiles(files);
    setError(null);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line prefer-destructuring
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;
    const toPass = files.length > 1 ? Array.from(files) : files[0];
    handleChanges(toPass);
  };

  const isDragging = useDragging({
    elementRef,
    inputRef,
    handleChanges,
  });

  return (
    <div className="FileDropZone__container">
      <div
        className={`dropZone ${isDragging ? "dropZone--active" : ""}`}
        data-testid="dropzone"
        ref={elementRef}
      >
        <p>{t("importer.dropHere")}</p>
        <p className="FileDropZone__hint">{t("importer.hint")}</p>
      </div>
      {error && <div className="FileDropZone__error">{error}</div>}
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
