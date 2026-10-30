import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { FileDropZone } from "./FileDropZone";

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
  const [fileOrFiles, setFiles] = useState<File | File[] | null>(null);
  const [rows, setRows] = useState<ICsvRow[] | null>(null);
  const [selectedRows, setSelectedRows] = useState<ICsvRow[] | null>(null);
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
        throw new Error("No file selected.");
      }

      if (Array.isArray(fileOrFiles)) {
        throw new Error("Only one file is supported.");
      }

      if (!selectedRows) {
        throw new Error("No rows selected");
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
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(err, "Import failed");
    }
  };

  const handleDrop = (files: File | Array<File>) => {
    logger.info("desde el handleDrop de importer", files);
  };

  const handleChange = async (files: File | Array<File>) => {
    logger.info("desde el handleChange de importer", files);

    setFiles(files);
  };

  const onSelect = async (files: File | Array<File>) => {
    logger.info("desde el onSelect de importer", files);

    if (!files) {
      throw new Error("No file selected.");
    }

    if (Array.isArray(files)) {
      throw new Error("Only one file is supported.");
    }

    try {
      const content = await FileReaderService.readAsText(files);
      const parsed = await PapaCsvParser.parse(content);
      setRows(parsed.rows);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(err, "Import failed");
    }
  };

  const handleRemoveFile = () => {
    setFiles(null);
    setRows(null);
  };

  const handleSelectionChange = (selectionState: ICsvRow[] | null) => {
    setSelectedRows(selectionState);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {!fileOrFiles ? (
        <FileDropZone
          onFileDrop={handleDrop}
          handleChange={handleChange}
          onFileSelect={onSelect}
          maxFileSize={200000}
          validFileTypes={["text/csv", "text/plain"]}
        />
      ) : (
        <button type="button" onClick={handleRemoveFile}>
          Subir otro archivo
        </button>
      )}

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
