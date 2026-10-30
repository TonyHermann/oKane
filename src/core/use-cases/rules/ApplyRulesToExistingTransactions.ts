import { planRuleApplication } from "@/core/services/ApplyCategorizationRules";
import type { Transaction } from "@/core/entities/Transaction";
import type { ICategorizationRuleRepository } from "@/core/repositories/ICategorizationRuleRepository";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";

export const ApplyRulesToExistingTransactions =
  (
    transactionRepository: ITransactionRepository,
    ruleRepository: ICategorizationRuleRepository,
  ) =>
  async (): Promise<Transaction[]> => {
    const [rules, transactions] = await Promise.all([
      ruleRepository.findAll(),
      transactionRepository.findAll(),
    ]);

    const plan = planRuleApplication(transactions, rules);

    const changed: Transaction[] = [
      ...plan.toCategorize.map(({ transaction, rule }) =>
        transaction.withCategoryFromRule(rule),
      ),
      ...plan.toRevert.map((transaction) => transaction.uncategorized()),
    ];

    await Promise.all(
      changed.map((transaction) => transactionRepository.update(transaction)),
    );

    return changed;
  };
