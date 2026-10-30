import { ValidationError } from "../errors/DomainErrors";
import type { Category } from "./Category";
import type { CategorizationRule } from "./CategorizationRule";

export type CreateTransactionProps = {
  amount: number;
  date: number;
  description: string;
  categories?: Category | null;
};

export type TransactionProps = CreateTransactionProps & {
  id: string;
  appliedRuleId?: string | null;
};

export class Transaction {
  public readonly id: string;

  public readonly amount: number;

  public readonly date: number;

  public readonly description: string;

  public readonly categories: Category | null;

  public readonly appliedRuleId: string | null;

  private constructor(props: TransactionProps) {
    if (!props.id) throw new ValidationError("ID es requerido");

    if (!props.description || typeof props.description !== "string")
      throw new ValidationError("La descripción es requerida");

    if (!Number.isFinite(props.date)) {
      throw new ValidationError("La fecha no es válida");
    }

    if (typeof props.amount !== "number" || !Number.isFinite(props.amount))
      throw new ValidationError("El importe debe ser un número válido");

    if (props.description.length < 2) {
      throw new Error("La descripción es demasiado corta.");
    }

    if (props.amount === 0) {
      throw new Error("El importe no puede ser cero");
    }

    if (props.description.length > 500)
      throw new ValidationError("Descripción demasiado larga");

    this.id = props.id;
    this.amount = props.amount;
    this.date = props.date;
    this.description = props.description;
    this.categories = props.categories ? props.categories : null;
    this.appliedRuleId = props.appliedRuleId ?? null;
  }

  static Create(props: CreateTransactionProps): Transaction {
    return new Transaction({
      ...props,
      id: crypto.randomUUID(),
    });
  }

  static Rehydrate(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  get fingerprint(): string {
    return `${new Date(this.date).toISOString()}|${this.amount}|${this.description}`;
  }

  get isManuallyCategorized(): boolean {
    return this.categories !== null && this.appliedRuleId === null;
  }

  withCategoryFromRule(rule: CategorizationRule): Transaction {
    return this.withCategory(rule.category, rule.id);
  }

  /**
   * Remove the category and the rule ownership behind it.
   *
   * Reconciliation calls this when the rule that applied a category no longer
   * justifies it. Naming it after the user would be a lie: the rule engine is
   * the caller, and a name that lies gets believed.
   */
  uncategorized(): Transaction {
    return this.withCategory(null, null);
  }

  private withCategory(
    category: Category | null,
    appliedRuleId: string | null,
  ): Transaction {
    return new Transaction({
      id: this.id,
      amount: this.amount,
      date: this.date,
      description: this.description,
      categories: category,
      appliedRuleId,
    });
  }
}

export interface AppliedRuleIdAfterEditProps {
  currentCategoryId: string | null;
  nextCategoryId: string | null;
  appliedRuleId: string | null;
}

/**
 * Provenance of a transaction after an edit.
 *
 * Changing the category is a human categorization decision, so automation stops
 * owning the result. Editing any other field — description, amount, date — leaves
 * ownership untouched: if a rule later stops matching a renamed description,
 * reconciliation resolves that honestly instead of this rule pre-empting it.
 *
 * This is domain policy, so it lives with the entity rather than inside the edit
 * form that happens to be its only caller today.
 */
export const resolveAppliedRuleIdAfterEdit = ({
  currentCategoryId,
  nextCategoryId,
  appliedRuleId,
}: AppliedRuleIdAfterEditProps): string | null =>
  nextCategoryId === currentCategoryId ? appliedRuleId : null;
