import type { Category } from "./Category";

export const RULE_CONDITION_TYPES = {
  DESCRIPTION_CONTAINS: "description_contains",
} as const;

export type RuleConditionType =
  (typeof RULE_CONDITION_TYPES)[keyof typeof RULE_CONDITION_TYPES];

export interface CategorizationRuleCondition {
  type: RuleConditionType;
  values: string[];
}

export interface CategorizationRule {
  id: string;
  order: number;
  enabled: boolean;
  condition: CategorizationRuleCondition;
  category: Category;
}

export interface CreateCategorizationRuleProps {
  order: number;
  enabled?: boolean;
  condition: CategorizationRuleCondition;
  category: Category;
}

export const createCategorizationRule = (
  props: CreateCategorizationRuleProps,
): CategorizationRule => ({
  id: crypto.randomUUID(),
  order: props.order,
  enabled: props.enabled ?? true,
  condition: props.condition,
  category: props.category,
});
