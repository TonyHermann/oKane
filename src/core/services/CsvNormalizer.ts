export class CsvNormalizer {
  static date(value: string, locale: "EU" | "US" = "EU"): number {
    if (locale === "EU") {
      const [day, month, year] = value.split(/[/-]/);
      return new Date(`${year}-${month}-${day}`).getTime();
    }
    return new Date(value).getTime();
  }

  static amount(value: string): number {
    // TODO: [currency-aware-import] Preserve signed bank amounts and expose income/expense semantics for configurable presentation.
    const cleaned = value
      .replace(/[^0-9.,-]/g, "") // saca símbolos ($, €, etc)
      .replace(/\.(?=.*\.)/g, "") // saca puntos de miles (1.234.56 → 1234.56)
      .replace(",", "."); // coma decimal → punto
    return Number(cleaned);
  }
}
