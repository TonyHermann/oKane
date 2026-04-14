import { useForm, type SubmitHandler } from "react-hook-form";
import { FileDropZone } from "./FileDropZone";

type FormValues = {
  file: File;
};

export const Importer = () => {
  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };

  const handleDrop = (files: FileList | File) => {
    console.log("desde el handleDrop de importer", files);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FileDropZone onFileDrop={handleDrop} />
      <button type="submit">Subir</button>
    </form>
  );
};
