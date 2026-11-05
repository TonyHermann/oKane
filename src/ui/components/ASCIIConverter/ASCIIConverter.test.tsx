import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ASCIIConverter } from "./ASCIIConverter";

class FakeImage {
  width = 100;

  height = 100;

  onload: (() => void) | null = null;

  onerror: (() => void) | null = null;

  private source = "";

  get src() {
    return this.source;
  }

  set src(value: string) {
    this.source = value;
    queueMicrotask(() => this.onload?.());
  }
}

const getImageData = vi.fn(
  (_x: number, _y: number, width: number, height: number) => ({
    data: new Uint8ClampedArray(width * height * 4),
  }),
);

const context = {
  drawImage: vi.fn(),
  getImageData,
} as unknown as CanvasRenderingContext2D;

const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "revokeObjectURL",
);

const setURLMethod = (name: string, value: () => string | void) => {
  Object.defineProperty(URL, name, {
    configurable: true,
    writable: true,
    value,
  });
};

const restoreURLMethod = (
  name: string,
  descriptor: PropertyDescriptor | undefined,
) => {
  if (descriptor) {
    Object.defineProperty(URL, name, descriptor);
    return;
  }

  delete (URL as unknown as Record<string, unknown>)[name];
};

const loadImage = async () => {
  const fileInput = document.querySelector<HTMLInputElement>(
    'input[type="file"]',
  );

  if (!fileInput) throw new Error("File input not found");

  const file = new File(["pixels"], "image.png", { type: "image/png" });
  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByAltText("Imagen seleccionada")).toBeInTheDocument();
  });
};

describe("ASCIIConverter", () => {
  beforeEach(() => {
    vi.stubGlobal("Image", FakeImage);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
    setURLMethod("createObjectURL", vi.fn(() => "blob:test"));
    setURLMethod("revokeObjectURL", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    restoreURLMethod("createObjectURL", originalCreateObjectURL);
    restoreURLMethod("revokeObjectURL", originalRevokeObjectURL);
  });

  it("starts with the classic preset and a width of 100", () => {
    render(<ASCIIConverter />);

    expect(screen.getByLabelText("Estilo")).toHaveValue("classic");
    expect(screen.getByLabelText("Ancho")).toHaveValue(100);
  });

  it("generates braille output when the braille preset is selected", async () => {
    render(<ASCIIConverter />);
    await loadImage();

    fireEvent.change(screen.getByLabelText("Estilo"), {
      target: { value: "braille" },
    });
    fireEvent.click(screen.getByRole("button", { name: "¡Generar!" }));

    const output = screen.getByRole("region", { name: "Resultado ASCII" });

    expect(output).toHaveTextContent("⣿");
    expect(output).not.toHaveTextContent("@");
  });

  it("shows an error and blocks generation when the width is out of range", async () => {
    render(<ASCIIConverter />);
    await loadImage();

    const colsInput = screen.getByLabelText("Ancho");
    fireEvent.change(colsInput, { target: { value: "5" } });
    fireEvent.blur(colsInput);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "El ancho debe ser un entero entre 20 y 300.",
    );
    expect(screen.getByRole("button", { name: "¡Generar!" })).toBeDisabled();
  });
});
