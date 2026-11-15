import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { RuleApplicationPreview } from "@/core/use-cases/rules/PreviewRulesApplication";
import { I18nProvider } from "@/ui/i18n";
import { ApplyRulesConfirmation } from "./ApplyRulesConfirmation";

const preview = (
  overrides: Partial<RuleApplicationPreview> = {},
): RuleApplicationPreview => ({
  toCategorize: 4,
  toRevert: 0,
  unchanged: 6,
  totalTransactions: 10,
  totalRules: 5,
  enabledRules: 3,
  ...overrides,
});

const renderConfirmation = (
  values: RuleApplicationPreview,
  onConfirm = vi.fn(),
  onCancel = vi.fn(),
) =>
  render(
    <I18nProvider>
      <ApplyRulesConfirmation
        preview={values}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </I18nProvider>,
  );

describe("ApplyRulesConfirmation", () => {
  it("renders the real counts", () => {
    renderConfirmation(preview());

    expect(
      screen.getByText(
        /Se van a evaluar 3 reglas habilitadas \(de 5 en total\) contra 10 transacciones\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Se categorizan: 4/)).toBeInTheDocument();
    expect(screen.getByText(/Se revierten: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Sin cambios: 6/)).toBeInTheDocument();
  });

  it("shows the destructive warning only when there is something to revert", () => {
    const { rerender } = render(
      <I18nProvider>
        <ApplyRulesConfirmation
          preview={preview()}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      </I18nProvider>,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    rerender(
      <I18nProvider>
        <ApplyRulesConfirmation
          preview={preview({ toRevert: 2 })}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "quita la categoría a 2 transacciones",
    );
  });

  it("uses the singular form for a single reverted transaction", () => {
    renderConfirmation(preview({ toRevert: 1 }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "quita la categoría a 1 transacción",
    );
  });

  it("confirms through the callback", async () => {
    const onConfirm = vi.fn();

    renderConfirmation(preview(), onConfirm);

    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancels without applying", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderConfirmation(preview(), onConfirm, onCancel);

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
