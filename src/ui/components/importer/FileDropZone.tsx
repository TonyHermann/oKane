import { useForm, type SubmitHandler } from "react-hook-form";

interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
}

type FormValues = {
  file: File;
};

export const FileDropZone = ({ onFileDrop }: FileDropZoneProps) => {
  const { register, handleSubmit } = useForm<FormValues>();

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];
      onFileDrop(file);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="FileDropZone__container">
        <input
          data-testid="dropzone"
          onDrop={handleDrop}
          type="file"
          {...register("file")}
        />
      </div>

      <button type="submit">Subir</button>
    </form>
  );
};
