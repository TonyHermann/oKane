import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import z from "zod";
import { FileDropZone } from "../importer/FileDropZone";
import { DomainError, ValidationError } from "@/core/errors/DomainErrors";
import {
  ASCII_PRESETS,
  charFor,
  DEFAULT_PRESET,
  getBrightness,
  isAsciiPresetId,
  type AsciiPresetId,
} from "@/core/services/AsciiArt";
import { FieldError } from "@/ui/components/FieldError/FieldError";
import { Select } from "@/ui/components/Select/Select";
import { useTranslation } from "@/ui/i18n";
import type { Translate } from "@/ui/i18n/I18nProvider";
import { logger } from "@/shared/logger/Logger";
import "./ASCIIConverter.css";

const MIN_COLS = 20;
const MAX_COLS = 300;
const DEFAULT_COLS = "100";

export const asciiConverterSchema = (t: Translate) =>
  z.object({
    cols: z.coerce
      .number()
      .refine(
        (value) =>
          Number.isInteger(value) && value >= MIN_COLS && value <= MAX_COLS,
        t("ascii.widthError", { min: MIN_COLS, max: MAX_COLS }),
      ),
  });

const ImageComponent = ({ img, alt }: { img: HTMLImageElement; alt: string }) => (
  <img style={{ maxWidth: "100px" }} src={img.src} alt={alt} />
);

interface RenderASCIIProps {
  img: HTMLImageElement;
  cols: number;
  canvas: RefObject<HTMLCanvasElement | null>;
  ramp: string;
}

const renderASCII = ({ img, cols, canvas, ramp }: RenderASCIIProps) => {
  const canvasElement = canvas?.current;

  if (!canvasElement) {
    throw new DomainError("No se encontró el canvas", "CANVAS_NOT_FOUND");
  }

  const canvasContext = canvasElement.getContext("2d");

  if (!canvasContext) {
    throw new DomainError(
      "No se pudo obtener el contexto 2D",
      "CANVAS_CONTEXT_UNAVAILABLE",
    );
  }
  const scale = cols / img.width;
  const rows = Math.floor(img.height * scale * 0.5);

  canvasElement.width = cols;
  canvasElement.height = rows;
  canvasContext.drawImage(img, 0, 0, cols, rows);

  const { data } = canvasContext.getImageData(0, 0, cols, rows);

  let ascii = "";

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i = (y * cols + x) * 4;
      ascii += charFor(
        getBrightness({ r: data[i], g: data[i + 1], b: data[i + 2] }),
        ramp,
      );
    }
    ascii += "\n";
  }

  return ascii;
};

export const ASCIIConverter = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState<File | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [ASCIIOutput, setASCIIOutput] = useState<string>("");
  const [preset, setPreset] = useState<AsciiPresetId>(DEFAULT_PRESET);
  const [colsInput, setColsInput] = useState(DEFAULT_COLS);
  const [colsTouched, setColsTouched] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const schema = useMemo(() => asciiConverterSchema(t), [t]);

  const presetOptions: { value: AsciiPresetId; label: string }[] = [
    { value: "classic", label: t("ascii.preset.classic") },
    { value: "braille", label: t("ascii.preset.braille") },
  ];

  const colsResult = schema.safeParse({ cols: colsInput });
  const colsError =
    !colsResult.success && colsTouched
      ? colsResult.error.issues[0]?.message
      : undefined;
  const canGenerate = Boolean(loadedImage) && colsResult.success;

  useEffect(() => {
    let cancelled = false;
    let imageUrl: string | null = null;
    const img = new Image();

    setLoadedImage(null);

    if (image) {
      imageUrl = URL.createObjectURL(image);
      img.onload = () => {
        if (!cancelled) setLoadedImage(img);
      };
      img.onerror = () => {
        if (!cancelled) setLoadedImage(null);
      };
      img.src = imageUrl;
    }

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [image]);

  const handleFilesAccepted = (file: File | Array<File>) => {
    if (Array.isArray(file)) {
      throw new ValidationError(t("ascii.onlyOneImage"), "file");
    }
    setLoadedImage(null);
    setImage(file);
  };

  const handlePresetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (isAsciiPresetId(value)) setPreset(value);
  };

  const handleGenerate = () => {
    if (!loadedImage || !colsResult.success) return;

    const ascii = renderASCII({
      img: loadedImage,
      cols: colsResult.data.cols,
      ramp: ASCII_PRESETS[preset],
      canvas: canvasRef,
    });

    logger.info("ascii: ", ascii);

    setASCIIOutput(ascii);
  };

  return (
    <>
      {!image ? (
        <FileDropZone
          validFileTypes={[
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
          ]}
          onFilesAccepted={handleFilesAccepted}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setImage(null);
            setLoadedImage(null);
            setASCIIOutput("");
          }}
        >
          {t("ascii.uploadAnother")}
        </button>
      )}
      <canvas className="hidden" ref={canvasRef} />
      {loadedImage && (
        <ImageComponent img={loadedImage} alt={t("ascii.selectedImage")} />
      )}
      <div className="ascii-controls">
        <div className="ascii-field">
          <Select
            id="ascii-preset"
            name="preset"
            label={t("ascii.presetLabel")}
            options={presetOptions}
            value={preset}
            onChange={handlePresetChange}
          />
        </div>
        <div className="ascii-field">
          <label htmlFor="ascii-cols">{t("ascii.width")}</label>
          <input
            id="ascii-cols"
            name="cols"
            type="number"
            inputMode="numeric"
            min={MIN_COLS}
            max={MAX_COLS}
            value={colsInput}
            onChange={(event) => setColsInput(event.target.value)}
            onBlur={() => setColsTouched(true)}
            aria-invalid={Boolean(colsError)}
            aria-describedby={colsError ? "ascii-cols-error" : undefined}
          />
          <FieldError id="ascii-cols-error" message={colsError} />
        </div>
      </div>
      <div className="ascii-actions">
        <button type="button" onClick={handleGenerate} disabled={!canGenerate}>
          {t("ascii.generate")}
        </button>
        <button type="button" disabled title={t("ascii.comingSoon")}>
          {t("ascii.save")}
        </button>
      </div>
      <section className="ascii-output" aria-label={t("ascii.result")}>
        {ASCIIOutput ? (
          <pre className="ascii-output__art">{ASCIIOutput}</pre>
        ) : (
          <p className="ascii-output__empty">
            {t("ascii.empty")}
          </p>
        )}
      </section>
    </>
  );
};
