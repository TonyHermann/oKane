import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import { ModalProvider } from "@/ui/components/modal/context/modalContext";
import { I18nProvider } from "@/ui/i18n";
import { es } from "@/ui/i18n/locales/es";
import { store } from "@/ui/store/store";
import { CreateCategoryForm } from "./CreateCategoryForm";

const renderForm = () =>
  render(
    <I18nProvider>
      <Provider store={store}>
        <ModalProvider>
          <CreateCategoryForm />
        </ModalProvider>
      </Provider>
    </I18nProvider>,
  );

describe("CreateCategoryForm accessibility", () => {
  it("associates the name label with the input", () => {
    renderForm();

    expect(
      screen.getByLabelText(es["categories.form.nameLabel"]),
    ).toHaveAttribute("id", "name");
  });

  it("connects the validation error to the input", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(
      screen.getByRole("button", { name: es["categories.form.submit"] }),
    );

    const input = screen.getByLabelText(es["categories.form.nameLabel"]);

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "name-error");
    expect(
      screen.getByText(es["categories.form.nameRequired"]),
    ).toBeInTheDocument();
  });
});
