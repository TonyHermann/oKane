import { useForm, type SubmitHandler } from "react-hook-form";

type FormValues = {
  file: File;
};

export const FileDropZone = () => {
  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };

  return (
    <div className="FileDropZone__container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register("file")} />
        <button type="submit">Subir</button>
      </form>
    </div>
  );
};
