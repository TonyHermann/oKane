import type { CategorizationRule } from "../entities/CategorizationRule";

export interface ICategorizationRuleRepository {
  save(rule: CategorizationRule): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<CategorizationRule[]>;
}
