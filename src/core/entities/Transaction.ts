export type TransactionProps = {
  id: string;
  amount: number;
  date: string;
  description: string;
};

export class Transaction {
  public readonly id: string;
  public readonly amount: number;
  public readonly date: string;
  public readonly description: string;

  constructor(props: TransactionProps) {
    if (props.amount === 0) {
      throw new Error("El importe no puede ser cero");
    }
    if (props.description.length < 2) {
      throw new Error("La descripción es demasiado corta.");
    }

    this.id = props.id;
    this.amount = props.amount;
    this.date = props.date;
    this.description = props.description;
  }
}
