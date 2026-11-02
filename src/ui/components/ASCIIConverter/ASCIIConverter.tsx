import { useEffect, useRef, useState, type RefObject } from "react";
import { FileDropZone } from "../importer/FileDropZone";
import { DomainError, ValidationError } from "@/core/errors/DomainErrors";
import { charFor, DEFAULT_RAMP, getBrightness } from "@/core/services/AsciiArt";
import { logger } from "@/shared/logger/Logger";
import "./ASCIIConverter.css";

const ImageComponent = ({ img }: { img: HTMLImageElement }) => (
  <img style={{ maxWidth: "100px" }} src={img.src} alt="foo" />
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
  const [image, setImage] = useState<File | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [ASCIIOutput, setASCIIOutput] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      throw new ValidationError("Solo se permite una imagen a la vez", "file");
    }
    setLoadedImage(null);
    setImage(file);
  };

  const handleGenerate = () => {
    if (!loadedImage) return;

    const ascii = renderASCII({
      img: loadedImage,
      cols: 200,
      ramp: DEFAULT_RAMP,
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
          Haz click aquí para subir otra imágen.
        </button>
      )}
      <canvas className="hidden" ref={canvasRef} />
      {loadedImage && <ImageComponent img={loadedImage} />}
      <button type="button" onClick={handleGenerate} disabled={!loadedImage}>
        ¡Generar!
      </button>
      <div id="output">{ASCIIOutput}</div>
    </>
  );
};
