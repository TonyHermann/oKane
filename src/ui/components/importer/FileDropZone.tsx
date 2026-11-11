import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import "./FileDropZone.css";
import { FileValidator } from "@/core/services/FileValidator";
import { logger } from "@/shared/logger/Logger";
import { useDragging } from "@/ui/hooks/useDragging";
import { useTranslation, type MessageKey } from "@/ui/i18n";

type DropZoneError = "tooLarge" | "invalidType" | "onlyOne" | "process";

const ERROR_MESSAGE_KEYS: Record<DropZoneError, MessageKey> = {
  tooLarge: "importer.fileTooLarge",
  invalidType: "importer.invalidType",
  onlyOne: "importer.onlyOneFile",
  process: "importer.processError",
};

type Props = {
  onFilesAccepted: (files: File | Array<File>) => void | Promise<void>;
  maxFileSize?: number;
  maxFiles?: number;
  validFileTypes?: string[];
  children?: ReactNode;
};

export const FileDropZone = ({
  onFilesAccepted,
  maxFileSize,
  maxFiles = 1,
  validFileTypes,
  children,
}: Props) => {
  const { t } = useTranslation();
  const [error, setError] = useState<DropZoneError | null>(null);
  const [fileOrFiles, setFiles] = useState<File | Array<File> | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isValidType, isValidSize } = FileValidator;

  const validateFile = (file: File): DropZoneError | null => {
    if (maxFileSize && !isValidSize(maxFileSize, file.size)) {
      return "tooLarge";
    }
    if (validFileTypes && !isValidType(validFileTypes, file.type)) {
      return "invalidType";
    }
    return null;
  };

  const reportError = (cause: unknown) => {
    const err = cause instanceof Error ? cause : new Error(String(cause));
    logger.error(err, "FileDropZone: file processing failed");
    setError("process");
  };

  const handleChanges = (files: File | Array<File>) => {
    const fileList = Array.isArray(files) ? files : [files];

    if (fileList.length > maxFiles) {
      setError("onlyOne");
      return;
    }

    const fileError = fileList.reduce<DropZoneError | null>(
      (found, file) => found ?? validateFile(file),
      null,
    );

    if (fileError) {
      setError(fileError);
      return;
    }

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
      {error && (
        <div className="FileDropZone__error">
          {t(ERROR_MESSAGE_KEYS[error])}
        </div>
      )}
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
