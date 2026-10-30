import { useState, type SubmitEvent } from "react";
import z from "zod";
import { useAppDispatch } from "@/ui/store/hooks";
import { saveCategory } from "@/ui/store/slices/categorySlices";
import useModalContext from "@/ui/components/modal/context/useModalContext";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede tener más de 100 carácteres"),
});

export const CreateCategoryForm = () => {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ name?: string[] }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { closeModal } = useModalContext();

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const result = createCategorySchema.safeParse({
      name,
    });

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});

    try {
      await dispatch(saveCategory({ name: result.data.name })).unwrap();
      closeModal();
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo guardar la categoría.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="Name">Nombre</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setErrors({});
            setSubmitError(null);
          }}
          name="Name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />

        {errors.name && <p id="name-error">{errors.name[0]}</p>}
      </div>
      {submitError && <p role="alert">{submitError}</p>}

      <button type="submit">Crear categoría</button>
    </form>
  );
};
