export class ColumnMapping {
  constructor(
    public readonly id: string,
    public dateColumn: string,
    public amountColumn: string,
    public descritionColumn: string,
  ) {}

  update(partial: Partial<Omit<ColumnMapping, "id">>) {
    if (partial.dateColumn) this.dateColumn = partial.dateColumn;
    if (partial.amountColumn) this.amountColumn = partial.amountColumn;
    if (partial.descritionColumn)
      this.descritionColumn = partial.descritionColumn;
  }
}
