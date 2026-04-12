import type { Category } from "./Category";

export type TransactionProps = {
  id: string;
  amount: number;
  date: Date;
  description: string;
  categories?: Category[];
};

export class Transaction {
  public readonly id: string;

  public readonly amount: number;

  public readonly date: Date;

  public readonly description: string;

  public readonly categories: Category[];

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
    this.categories = props.categories ? props.categories : [];
  }
}
