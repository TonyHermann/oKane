export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly created_at: Date,
  ) {
    if (!name) {
      throw new Error("El nombre de la categoría es obligatorio.");
    }
  }
}
