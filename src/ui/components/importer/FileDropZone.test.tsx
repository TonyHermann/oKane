import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@/ui/i18n";
import { FileDropZone } from "./FileDropZone";

// Helpers
const createMockFile = (
  content: string,
  filename: string = "test.csv",
  type: string = "text/csv",
): File => {
  const blob = new Blob([content], { type });
  return new File([blob], filename, { type });
};

const renderDropZone = (props: {
  onFilesAccepted: (files: File | Array<File>) => void | Promise<void>;
  maxFileSize?: number;
  maxFiles?: number;
  validFileTypes?: string[];
}) =>
  render(
    <I18nProvider>
      <FileDropZone
        onFilesAccepted={props.onFilesAccepted}
        maxFileSize={props.maxFileSize}
        maxFiles={props.maxFiles}
        validFileTypes={props.validFileTypes}
      />
    </I18nProvider>,
  );

describe("FileDropZone", () => {
  it("should accept file via drop", async () => {
    const csv = `date,amount,description
2025-01-01,100,test!
2025-01-01,100,test!
`;
    const csvFile = createMockFile(csv);

    const onFilesAccepted = vi.fn();
    renderDropZone({ onFilesAccepted });

    const dropZone = screen.getByTestId("dropzone");

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [csvFile] },
    });

    expect(onFilesAccepted).toHaveBeenCalledWith(csvFile);
  });

  it("reports the only-one-file validation when more than one file is dropped", () => {
    const onFilesAccepted = vi.fn();
    renderDropZone({ onFilesAccepted });

    fireEvent.drop(screen.getByTestId("dropzone"), {
      dataTransfer: {
        files: [createMockFile("a"), createMockFile("b", "second.csv")],
      },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Solo se admite un archivo.",
    );
    expect(onFilesAccepted).not.toHaveBeenCalled();
  });

  it("reports the invalid-type validation for a rejected MIME type", () => {
    const onFilesAccepted = vi.fn();
    renderDropZone({
      onFilesAccepted,
      validFileTypes: ["text/csv"],
    });

    fireEvent.drop(screen.getByTestId("dropzone"), {
      dataTransfer: {
        files: [createMockFile("plain", "notes.txt", "text/plain")],
      },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "El archivo que has ingresado, no es de un tipo válido.",
    );
    expect(onFilesAccepted).not.toHaveBeenCalled();
  });

  it("reports the file-too-large validation for an oversized file", () => {
    const onFilesAccepted = vi.fn();
    renderDropZone({
      onFilesAccepted,
      maxFileSize: 4,
    });

    fireEvent.drop(screen.getByTestId("dropzone"), {
      dataTransfer: { files: [createMockFile("too large")] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "El archivo que has ingresado, supera el límite de peso.",
    );
    expect(onFilesAccepted).not.toHaveBeenCalled();
  });

  it("shows the generic process message without leaking an unknown cause", async () => {
    const onFilesAccepted = vi.fn().mockRejectedValue(new Error("boom"));
    renderDropZone({ onFilesAccepted });

    fireEvent.drop(screen.getByTestId("dropzone"), {
      dataTransfer: { files: [createMockFile("a")] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo procesar el archivo.",
    );
  });
});
