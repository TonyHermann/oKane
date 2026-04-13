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

  const handleDrop = () => {
    console.log("Desde el handle!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FileDropZone onFileDrop={handleDrop}>
        <input type="file" {...register("file")} />
      </FileDropZone>
      <button type="submit">Subir</button>
    </form>
  );
};
