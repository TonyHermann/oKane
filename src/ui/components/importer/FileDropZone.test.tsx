import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

describe("FileDropZone", () => {
  it("should accept file via drop", async () => {
    const csv = `date,amount,description
2025-01-01,100,test!
2025-01-01,100,test!
`;
    const csvFile = createMockFile(csv);

    const onFileDrop = vi.fn();
    render(<FileDropZone onFileDrop={onFileDrop} />);

    const dropZone = screen.getByTestId("dropzone");

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [csvFile] },
    });

    expect(onFileDrop).toHaveBeenCalledWith(csvFile);
  });

  it("should accept file via input click", async () => {});

  it("should reject non csv filetype", async () => {});

  it("should display current selected file name", async () => {});

  it("should call onFileSelect callback with file", async () => {});
});
