import type { ICategorizationRuleRepository } from "@/core/repositories/ICategorizationRuleRepository";

export const DeleteCategorizationRule = (
  repository: ICategorizationRuleRepository,
) => (id: string) => repository.delete(id);
