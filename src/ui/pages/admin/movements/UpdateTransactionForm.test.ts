import { describe, it, expect } from "vitest";
import { en } from "@/ui/i18n/locales/en";
import { es, type MessageKey } from "@/ui/i18n/locales/es";
import type { Translate } from "@/ui/i18n/I18nProvider";
import { updateTransactionSchema } from "./UpdateTransactionForm";

const translate =
  (catalog: Record<MessageKey, string>): Translate =>
  (key) =>
    catalog[key];

const schema = updateTransactionSchema(translate(es));

describe("updateTransactionSchema", () => {
  it("accepts an empty categoryId", () => {
    const input = {
      description: "Compra de supermercado",
      amount: 25,
      date: new Date("2026-01-01"),
      categoryId: "",
    };

    const result = schema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("accepts an non empty categoryId", () => {
    const mockId = "71248107412801321A093821";
    const input = {
      description: "Compra de supermercado",
      amount: 25,
      date: new Date("2026-01-01"),
      categoryId: mockId,
    };

    const result = schema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("rejects a null categoryId", () => {
    const input = {
      description: "Compra de supermercado",
      amount: 25,
      date: new Date("2026-01-01"),
      categoryId: null,
    };

    const result = schema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("uses the message from the active locale catalog", () => {
    const input = {
      description: "",
      amount: 25,
      date: new Date("2026-01-01"),
      categoryId: "",
    };

    const esResult = updateTransactionSchema(translate(es)).safeParse(input);
    const enResult = updateTransactionSchema(translate(en)).safeParse(input);

    expect(esResult.success).toBe(false);
    expect(enResult.success).toBe(false);
    expect(esResult.error?.issues[0]?.message).toBe(
      "La descripción es obligatoria.",
    );
    expect(enResult.error?.issues[0]?.message).toBe("Description is required.");
  });
});
