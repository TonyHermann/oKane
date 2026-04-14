export const FileValidator = {
  isValid(file: File) {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ["text/csv", "text/plain"];
    return file.size <= maxSize && allowedTypes.includes(file.type);
  },
};
