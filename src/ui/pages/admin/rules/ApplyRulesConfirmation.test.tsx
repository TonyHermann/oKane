import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { RuleApplicationPreview } from "@/core/use-cases/rules/PreviewRulesApplication";
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

describe("ApplyRulesConfirmation", () => {
  it("renders the real counts", () => {
    render(
      <ApplyRulesConfirmation
        preview={preview()}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

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
      <ApplyRulesConfirmation
        preview={preview()}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    rerender(
      <ApplyRulesConfirmation
        preview={preview({ toRevert: 2 })}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "quita la categoría a 2 transacciones",
    );
  });

  it("confirms through the callback", async () => {
    const onConfirm = vi.fn();

    render(
      <ApplyRulesConfirmation
        preview={preview()}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancels without applying", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ApplyRulesConfirmation
        preview={preview()}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
