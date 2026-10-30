export type CreateCategoryProps = {
  name: string;
};

export type CategoryProps = CreateCategoryProps & {
  id: string;
  created_at: number;
};

export class Category {
  public readonly id: string;

  public readonly name: string;

  public readonly created_at: number;

  private constructor(props: CategoryProps) {
    if (!props.name.trim()) {
      throw new Error("El nombre de la categoría es obligatorio.");
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.created_at = props.created_at;
  }

  static Create(props: CreateCategoryProps): Category {
    return new Category({
      ...props,
      id: crypto.randomUUID(),
      created_at: new Date().getTime(),
    });
  }

  static Rehydrate(props: CategoryProps): Category {
    return new Category(props);
  }
}
