import { useMemo, useState, type SubmitEvent } from "react";
import z from "zod";
import { useAppDispatch } from "@/ui/store/hooks";
import { saveCategory } from "@/ui/store/slices/categorySlices";
import useModalContext from "@/ui/components/modal/context/useModalContext";
import { useTranslation } from "@/ui/i18n";
import type { Translate } from "@/ui/i18n/I18nProvider";

export const createCategorySchema = (t: Translate) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t("categories.form.nameRequired"))
      .max(100, t("categories.form.nameMax")),
  });

export const CreateCategoryForm = () => {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ name?: string[] }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { closeModal } = useModalContext();
  const { t } = useTranslation();
  const schema = useMemo(() => createCategorySchema(t), [t]);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const result = schema.safeParse({
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
        error instanceof Error
          ? error.message
          : t("categories.form.saveError"),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">{t("categories.form.nameLabel")}</label>
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

      <button type="submit">{t("categories.form.submit")}</button>
    </form>
  );
};
