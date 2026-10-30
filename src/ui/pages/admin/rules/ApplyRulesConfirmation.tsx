import Modal from "@/ui/components/modal/Modal";
import type { RuleApplicationPreview } from "@/core/use-cases/rules/PreviewRulesApplication";

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
          Se van a evaluar {enabledRules} reglas habilitadas (de {totalRules} en
          total) contra {totalTransactions} transacciones.
        </p>
        <ul>
          <li>
            Se categorizan: {toCategorize} — las que coinciden con una regla. Si
            coinciden varias, gana la primera según el orden.
          </li>
          <li>
            Se revierten: {toRevert} — tenían categoría de una regla que ya no
            existe o cuya condición cambió. Vuelven a quedar sin categoría.
          </li>
          <li>
            Sin cambios: {unchanged} — incluye todo lo puesto a mano y lo de
            reglas pausadas.
          </li>
        </ul>
        {toRevert > 0 && (
          <p role="alert">
            <strong>
              Atención: esta acción quita la categoría a {toRevert}{" "}
              transacciones.
            </strong>
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" onClick={onConfirm}>
          Confirmar
        </button>
      </Modal.Footer>
    </>
  );
};
