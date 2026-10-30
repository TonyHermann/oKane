import { useState, type SubmitEvent } from "react";
import z from "zod";
import type { CategoryState } from "@/ui/store/slices/categorySlices";
import { updateCategory } from "@/ui/store/slices/categorySlices";
import { useAppDispatch } from "@/ui/store/hooks";
import useModalContext from "@/ui/components/modal/context/useModalContext";

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
});

interface UpdateCategoryFormProps {
  category: CategoryState;
}

export const UpdateCategoryForm = ({ category }: UpdateCategoryFormProps) => {
  const [name, setName] = useState(category.name);
  const [errors, setErrors] = useState<{ name?: string[] }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { closeModal } = useModalContext();

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const result = updateCategorySchema.safeParse({ name });
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    try {
      await dispatch(
        updateCategory({ ...category, name: result.data.name }),
      ).unwrap();
      closeModal();
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo editar la categoría.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="category-name">Nombre</label>
        <input
          type="text"
          id="category-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setErrors({});
            setSubmitError(null);
          }}
          name="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "category-name-error" : undefined}
        />
        {errors.name && <p id="category-name-error">{errors.name[0]}</p>}
      </div>
      {submitError && <p role="alert">{submitError}</p>}
      <button type="submit">Guardar cambios</button>
    </form>
  );
};
