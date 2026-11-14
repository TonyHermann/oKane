import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { I18nProvider } from "@/ui/i18n";
import { store } from "@/ui/store/store";
import { FileReaderService } from "@/infraestructure/files/FileReaderService";
import { PapaCsvParser } from "@/infraestructure/parsers/PapaCsvParser";
import { CsvParseError } from "@/core/errors/ImportErrors";
import { Importer } from "./Importer";

vi.mock("@/infraestructure/files/FileReaderService", () => ({
  FileReaderService: { readAsText: vi.fn() },
}));

vi.mock("@/infraestructure/parsers/PapaCsvParser", () => ({
  PapaCsvParser: { parse: vi.fn() },
}));

const createMockFile = (content: string): File =>
  new File([content], "test.csv", { type: "text/csv" });

const renderImporter = () =>
  render(
    <Provider store={store}>
      <I18nProvider>
        <Importer />
      </I18nProvider>
    </Provider>,
  );

describe("Importer", () => {
  it("shows a specific parse error instead of the generic import failure", async () => {
    vi.mocked(FileReaderService.readAsText).mockResolvedValue("bad,csv\n1");
    vi.mocked(PapaCsvParser.parse).mockRejectedValue(
      new CsvParseError("Error al parsear CSV: Too few fields"),
    );

    renderImporter();

    fireEvent.drop(screen.getByTestId("dropzone"), {
      dataTransfer: { files: [createMockFile("bad,csv\n1")] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo interpretar el CSV. Revisa el formato y las comillas.",
    );
    expect(screen.queryByText("No se pudieron importar las transacciones.")).toBeNull();
  });
});
