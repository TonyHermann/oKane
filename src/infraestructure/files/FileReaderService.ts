import { FileReadError } from "@/core/errors/ImportErrors";

export const FileReaderService = {
  readAsText: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };

      reader.onerror = () => {
        reject(new FileReadError());
      };

      reader.readAsText(file);
    });
  },
};
