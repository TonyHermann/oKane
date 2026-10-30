import { GetAllCategorizationRules } from "@/core/use-cases/rules/GetAllCategorizationRules";
import { SaveCategorizationRule } from "@/core/use-cases/rules/SaveCategorizationRule";
import { DeleteCategorizationRule } from "@/core/use-cases/rules/DeleteCategorizationRule";
import { ApplyRulesToExistingTransactions } from "@/core/use-cases/rules/ApplyRulesToExistingTransactions";
import { PreviewRulesApplication } from "@/core/use-cases/rules/PreviewRulesApplication";
import { IndexedDBCategorizationRuleRepository } from "@/infraestructure/persistence/IndexedDBCategorizationRuleRepository";
import { IndexedDBTransactionRepository } from "@/infraestructure/persistence/IndexedDBTransactionRepository";

const repository = new IndexedDBCategorizationRuleRepository();

export const CategorizationRuleActions = {
  applyAll: ApplyRulesToExistingTransactions(
    new IndexedDBTransactionRepository(),
    repository,
  ),
  delete: DeleteCategorizationRule(repository),
  getAll: GetAllCategorizationRules(repository),
  preview: PreviewRulesApplication(
    new IndexedDBTransactionRepository(),
    repository,
  ),
  save: SaveCategorizationRule(repository),
};
