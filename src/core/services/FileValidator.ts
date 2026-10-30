export const FileValidator = {
  isValidType(allowedTypes: string[], fileType: string) {
    return allowedTypes.includes(fileType);
  },
  isValidSize(maxSize: number, fileSize: number) {
    return fileSize <= maxSize;
  },
};
