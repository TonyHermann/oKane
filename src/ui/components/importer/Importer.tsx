import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FileDropZone } from "./FileDropZone";

type FormValues = {
  file: File;
};

export const Importer = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const [fileOrFiles, setFiles] = useState<File | Array<File> | null>(null);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
    console.log(fileOrFiles);
  };

  const handleDrop = (files: File | Array<File>) => {
    console.log("desde el handleDrop de importer", files);
  };

  const handleChange = (files: File | Array<File>) => {
    console.log("desde el handleChange de importer", files);
    setFiles(files);
  };

  const onSelect = (files: File | Array<File>) => {
    console.log("desde el onSelect de importer", files);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FileDropZone
        onFileDrop={handleDrop}
        handleChange={handleChange}
        onFileSelect={onSelect}
        maxFileSize={20000}
        validFileTypes={["text/csv", "text/plain"]}
      />
      <button type="submit">Subir</button>
    </form>
  );
};
