import { ValidationError } from "../errors/DomainErrors";

export const DEFAULT_RAMP = "@%#*+=-:. "; // dark -> light

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export const getBrightness = ({ r, g, b }: RGB): number => {
  return 0.299 * r + 0.587 * g + 0.114 * b; // 0 to 255
};

export const charFor = (brightness: number, ramp: string): string => {
  if (!ramp) {
    throw new ValidationError(
      "El conjunto de caracteres no puede estar vacío",
      "ramp",
    );
  }

  const index = Math.floor((brightness / 255) * (ramp.length - 1));
  return ramp[index];
};
