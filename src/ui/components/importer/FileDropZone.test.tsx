import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider, useTranslation } from "@/ui/i18n";
import { FileDropZone } from "./FileDropZone";

// Helpers
const createMockFile = (
  content: string,
  filename: string = "test.csv",
  type: string = "text/csv",
): File => {
  const blob = new Blob([content], { type });
  return new File([blob], filename);
};

const LocaleSwitcher = () => {
  const { setLocale } = useTranslation();

  return (
    <button type="button" onClick={() => setLocale("en")}>
      switch to en
    </button>
  );
};

describe("FileDropZone", () => {
  it("should accept file via drop", async () => {
    const csv = `date,amount,description
2025-01-01,100,test!
2025-01-01,100,test!
`;
    const csvFile = createMockFile(csv);

    const onFilesAccepted = vi.fn();
    render(
      <I18nProvider>
        <FileDropZone onFilesAccepted={onFilesAccepted} />
      </I18nProvider>,
    );

    const dropZone = screen.getByTestId("dropzone");

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [csvFile] },
    });

    expect(onFilesAccepted).toHaveBeenCalledWith(csvFile);
  });

  it("should accept file via input click", async () => {});

  it("should reject non csv filetype", async () => {});

  it("should display current selected file name", async () => {});

  it("should call onFilesAccepted callback with file", async () => {});

  it("re-translates a visible error when the locale changes", () => {
    const onFilesAccepted = vi.fn();
    render(
      <I18nProvider>
        <FileDropZone onFilesAccepted={onFilesAccepted} maxFileSize={1} />
        <LocaleSwitcher />
      </I18nProvider>,
    );

    fireEvent.drop(screen.getByTestId("dropzone"), {
      dataTransfer: { files: [createMockFile("too large")] },
    });

    expect(
      screen.getByText(
        "El archivo que has ingresado, supera el límite de peso.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "switch to en" }));

    expect(
      screen.getByText(
        "The file you entered exceeds the maximum allowed size.",
      ),
    ).toBeInTheDocument();
  });

  it("reports that only one file is supported when several are dropped", () => {
    const onFilesAccepted = vi.fn();
    render(
      <I18nProvider>
        <FileDropZone onFilesAccepted={onFilesAccepted} />
      </I18nProvider>,
    );

    fireEvent.drop(screen.getByTestId("dropzone"), {
      dataTransfer: {
        files: [createMockFile("first"), createMockFile("second")],
      },
    });

    expect(screen.getByText("Solo se admite un archivo.")).toBeInTheDocument();
    expect(onFilesAccepted).not.toHaveBeenCalled();
  });
});
