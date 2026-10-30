import { planRuleApplication } from "@/core/services/ApplyCategorizationRules";
import type { ICategorizationRuleRepository } from "@/core/repositories/ICategorizationRuleRepository";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";

export interface RuleApplicationPreview {
  toCategorize: number;
  toRevert: number;
  unchanged: number;
  totalTransactions: number;
  totalRules: number;
  enabledRules: number;
}

export const PreviewRulesApplication =
  (
    transactionRepository: ITransactionRepository,
    ruleRepository: ICategorizationRuleRepository,
  ) =>
  async (): Promise<RuleApplicationPreview> => {
    const [rules, transactions] = await Promise.all([
      ruleRepository.findAll(),
      transactionRepository.findAll(),
    ]);

    const plan = planRuleApplication(transactions, rules);

    return {
      toCategorize: plan.toCategorize.length,
      toRevert: plan.toRevert.length,
      unchanged: plan.unchanged.length,
      totalTransactions: transactions.length,
      totalRules: rules.length,
      enabledRules: rules.filter((rule) => rule.enabled).length,
    };
  };
