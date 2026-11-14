import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import "./FileDropZone.css";
import { type MessageKey, useTranslation } from "@/ui/i18n";
import { FileValidator } from "@/core/services/FileValidator";
import { useDragging } from "@/ui/hooks/useDragging";
import { logger } from "@/shared/logger/Logger";

type Props = {
  onFilesAccepted: (files: File | Array<File>) => void | Promise<void>;
  maxFileSize?: number;
  maxFiles?: number;
  validFileTypes?: string[];
  children?: ReactNode;
};

type FileDropZoneError = "tooLarge" | "invalidType" | "tooMany" | "process";

const FIXED_ERROR_MESSAGES: Record<
  Exclude<FileDropZoneError, "tooMany">,
  MessageKey
> = {
  tooLarge: "importer.fileTooLarge",
  invalidType: "importer.invalidType",
  process: "importer.processError",
};

const toError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));

export const FileDropZone = ({
  onFilesAccepted,
  maxFileSize,
  maxFiles = 1,
  validFileTypes,
  children,
}: Props) => {
  const { t } = useTranslation();
  const [error, setError] = useState<FileDropZoneError | null>(null);
  const [fileOrFiles, setFiles] = useState<File | Array<File> | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isValidType, isValidSize } = FileValidator;

  const validateFiles = (files: File | Array<File>): FileDropZoneError | null => {
    const fileList = files instanceof File ? [files] : files;

    if (fileList.length > maxFiles) {
      return "tooMany";
    }

    if (
      maxFileSize !== undefined &&
      fileList.some((file) => !isValidSize(maxFileSize, file.size))
    ) {
      return "tooLarge";
    }

    if (
      validFileTypes &&
      fileList.some((file) => !isValidType(validFileTypes, file.type))
    ) {
      return "invalidType";
    }

    return null;
  };

  const getErrorText = (value: FileDropZoneError): string => {
    if (value === "tooMany") {
      return maxFiles === 1
        ? t("importer.onlyOneFile")
        : t("importer.tooManyFiles", { count: maxFiles });
    }

    return t(FIXED_ERROR_MESSAGES[value]);
  };

  const reportProcessError = (cause: unknown) => {
    // The cause is diagnostic only: the user gets the stable process message.
    logger.error(toError(cause), "FileDropZone: file processing failed");
    setError("process");
  };

  const handleChanges = (files: File | Array<File>) => {
    const validationError = validateFiles(files);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const result = onFilesAccepted(files);
      if (result instanceof Promise) {
        result.catch(reportProcessError);
      }
    } catch (cause) {
      reportProcessError(cause);
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
        <div className="FileDropZone__error" role="alert">
          {getErrorText(error)}
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
