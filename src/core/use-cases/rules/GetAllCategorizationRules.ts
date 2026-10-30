import type { ICategorizationRuleRepository } from "@/core/repositories/ICategorizationRuleRepository";

export const GetAllCategorizationRules = (
  repository: ICategorizationRuleRepository,
) => () => repository.findAll();
