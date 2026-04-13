import { useState, type DragEvent, type FC, type ReactNode } from "react";

type Props = {
  onFileDrop: (file: File) => void;
  children?: ReactNode;
};

export const FileDropZone = (props: Props) => {
  const { onFileDrop, children } = props;
  const [error, setError] = useState<Error | null>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];
      onFileDrop(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="FileDropZone__container">
      <div
        className="dropZone"
        data-testid="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>¡Dropea un archivo aquí!</p>
      </div>
      {children}
    </div>
  );
};
