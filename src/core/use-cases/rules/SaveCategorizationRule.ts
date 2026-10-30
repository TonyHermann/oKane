import type { CategorizationRule } from "@/core/entities/CategorizationRule";
import type { ICategorizationRuleRepository } from "@/core/repositories/ICategorizationRuleRepository";

export const SaveCategorizationRule = (
  repository: ICategorizationRuleRepository,
) => (rule: CategorizationRule) => repository.save(rule);
