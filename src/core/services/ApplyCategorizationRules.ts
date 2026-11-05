import type { CategorizationRule } from "../entities/CategorizationRule";
import type { Transaction } from "../entities/Transaction";

const conditionValues = (rule: CategorizationRule): string[] => {
  if (!Array.isArray(rule.condition?.values)) return [];

  return rule.condition.values
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value !== "");
};

const isValidRule = (rule: CategorizationRule): boolean => {
  return Boolean(
    rule &&
      rule.enabled &&
      Number.isFinite(rule.order) &&
      rule.condition?.type === "description_contains" &&
      conditionValues(rule).length > 0 &&
      rule.category?.id &&
      typeof rule.category.name === "string" &&
      rule.category.name.trim(),
  );
};

const matchesRule = (rule: CategorizationRule, description: string): boolean =>
  conditionValues(rule).some((value) =>
    description.includes(value.toLocaleLowerCase()),
  );

export const findMatchingRule = (
  description: string,
  rules: CategorizationRule[],
): CategorizationRule | null => {
  const normalizedDescription = description.toLocaleLowerCase();

  const match = [...rules]
    .sort((left, right) => left.order - right.order)
    .find(
      (rule) => isValidRule(rule) && matchesRule(rule, normalizedDescription),
    );

  return match ?? null;
};

export interface RuleApplicationChange {
  transaction: Transaction;
  rule: CategorizationRule;
}

export interface RuleApplicationPlan {
  toCategorize: RuleApplicationChange[];
  toRevert: Transaction[];
  unchanged: Transaction[];
}

export const planRuleApplication = (
  transactions: Transaction[],
  allRules: CategorizationRule[],
): RuleApplicationPlan => {
  const plan: RuleApplicationPlan = {
    toCategorize: [],
    toRevert: [],
    unchanged: [],
  };

  transactions.forEach((transaction) => {
    if (transaction.isManuallyCategorized) {
      plan.unchanged.push(transaction);
      return;
    }

    const match = findMatchingRule(transaction.description, allRules);

    if (match !== null) {
      const alreadyApplied =
        match.id === transaction.appliedRuleId &&
        match.category.id === transaction.categories?.id;

      if (alreadyApplied) {
        plan.unchanged.push(transaction);
      } else {
        plan.toCategorize.push({ transaction, rule: match });
      }

      return;
    }

    if (transaction.appliedRuleId === null) {
      plan.unchanged.push(transaction);
      return;
    }

    // Inconsistent legacy state: a rule id survived without its category. There
    // is nothing to revert, so leave it alone until a rule matches again.
    if (transaction.categories === null) {
      plan.unchanged.push(transaction);
      return;
    }

    const owner = allRules.find(
      (rule) => rule.id === transaction.appliedRuleId,
    );

    if (owner === undefined) {
      plan.toRevert.push(transaction);
      return;
    }

    // A disabled rule is a pause, not an undo: it keeps what it already applied.
    if (!owner.enabled) {
      plan.unchanged.push(transaction);
      return;
    }

    plan.toRevert.push(transaction);
  });

  return plan;
};
