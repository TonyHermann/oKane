export const FileValidator = {
  isValidType(allowedTypes: string[], file: File) {
    return allowedTypes.includes(file.type);
  },
  isValidSize(maxSize: number, file: File) {
    return file.size <= maxSize;
  },
};
