import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { FileDropZone } from "./FileDropZone";

import { ValidationError } from "@/core/errors/DomainErrors";
import { FileReaderService } from "@/infraestructure/files/FileReaderService";

import { PapaCsvParser } from "@/infraestructure/parsers/PapaCsvParser";
import { CsvSchema } from "@/core/entities/Import/CsvSchema";
import { logger } from "@/shared/logger/Logger";
import type { ICsvRow } from "@/core/services/ICsvParser";
import { useAppDispatch } from "@/ui/store/hooks";
import { importTransactions } from "@/ui/store/slices/transactionsSlices";
import { CsvTable } from "../CsvTable/CsvTable";
import { ColumnMapping, type ColumnMappingValue } from "./ColumnMapping";

type FormValues = {
  file: File;
};

export const Importer = () => {
  const dispatch = useAppDispatch();
  const { handleSubmit } = useForm<FormValues>();
  const [fileOrFiles, setFiles] = useState<File | null>(null);
  const [rows, setRows] = useState<ICsvRow[] | null>(null);
  const [selectedRows, setSelectedRows] = useState<ICsvRow[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const requiredColumns = [
    "dateColumn",
    "amountColumn",
    "descriptionColumn",
  ] as const;

  const [mapping, setMapping] = useState<ColumnMappingValue>({
    dateColumn: "",
    amountColumn: "",
    descriptionColumn: "",
  });

  const onSubmit: SubmitHandler<FormValues> = async () => {
    try {
      if (!fileOrFiles) {
        throw new ValidationError("No file selected.", "file");
      }

      if (!selectedRows) {
        throw new ValidationError("No rows selected", "rows");
      }

      const schema = new CsvSchema(["date", "amount", "description"]);

      const result = await dispatch(
        importTransactions({ rows: selectedRows, schema, mapping }),
      ).unwrap();

      logger.info("Import success", {
        imported: result.imported,
        failed: result.failed,
        total: result.total,
      });
    } catch (cause: unknown) {
      const err = cause instanceof Error ? cause : new Error(String(cause));
      logger.error(err, "Import failed");
    }
  };

  const handleFilesAccepted = async (files: File | Array<File>) => {
    if (Array.isArray(files)) {
      throw new ValidationError("Only one file is supported.", "file");
    }

    setError(null);
    setFiles(files);

    try {
      const content = await FileReaderService.readAsText(files);
      const parsed = await PapaCsvParser.parse(content);
      setRows(parsed.rows);
    } catch (cause: unknown) {
      const err = cause instanceof Error ? cause : new Error(String(cause));
      setError(err);
      logger.error(err, "Import failed");
    }
  };

  const handleRemoveFile = () => {
    setFiles(null);
    setRows(null);
    setError(null);
  };

  const handleSelectionChange = (selectionState: ICsvRow[] | null) => {
    setSelectedRows(selectionState);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {!fileOrFiles ? (
        <FileDropZone
          onFilesAccepted={handleFilesAccepted}
          maxFileSize={200000}
          validFileTypes={["text/csv", "text/plain"]}
        />
      ) : (
        <button type="button" onClick={handleRemoveFile}>
          Subir otro archivo
        </button>
      )}

      {error && <p role="alert">{error.message}</p>}

      {rows && rows.length > 0 && (
        <>
          <h4>Previsualización</h4>

          <CsvTable
            headers={rows[0]}
            rows={rows}
            onSelectionChange={handleSelectionChange}
          />
          <ColumnMapping
            requiredColumns={requiredColumns}
            availableColumns={Object.keys(rows[0])}
            mapping={mapping}
            onChange={setMapping}
          />
        </>
      )}

      <button type="submit">Subir</button>
    </form>
  );
};
