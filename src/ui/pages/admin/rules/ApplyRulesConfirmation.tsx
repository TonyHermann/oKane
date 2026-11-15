import Modal from "@/ui/components/modal/Modal";
import type { RuleApplicationPreview } from "@/core/use-cases/rules/PreviewRulesApplication";
import { usePlural, useTranslation } from "@/ui/i18n";

interface ApplyRulesConfirmationProps {
  preview: RuleApplicationPreview;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ApplyRulesConfirmation = ({
  preview,
  onConfirm,
  onCancel,
}: ApplyRulesConfirmationProps) => {
  const { t } = useTranslation();
  const plural = usePlural();
  const {
    enabledRules,
    totalRules,
    totalTransactions,
    toCategorize,
    toRevert,
    unchanged,
  } = preview;

  return (
    <>
      <Modal.Body>
        <p>
          {t("rules.confirm.summary", {
            enabledRules,
            totalRules,
            totalTransactions,
          })}
        </p>
        <ul>
          <li>{t("rules.confirm.toCategorize", { count: toCategorize })}</li>
          <li>{t("rules.confirm.toRevert", { count: toRevert })}</li>
          <li>{t("rules.confirm.unchanged", { count: unchanged })}</li>
        </ul>
        {toRevert > 0 && (
          <p role="alert">
            <strong>
              {plural(
                {
                  one: "rules.confirm.warning.one",
                  other: "rules.confirm.warning.other",
                },
                toRevert,
              )}
            </strong>
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="button" onClick={onConfirm}>
          {t("common.confirm")}
        </button>
      </Modal.Footer>
    </>
  );
};
