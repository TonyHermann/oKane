import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "./I18nProvider";
import { usePlural, type PluralKeys } from "./usePlural";
import { useTranslation } from "./useTranslation";

const rowsKeys: PluralKeys = {
  one: "common.rows.one",
  other: "common.rows.other",
};

const Probe = () => {
  const plural = usePlural();
  const { setLocale } = useTranslation();

  return (
    <div>
      <span data-testid="one">{plural(rowsKeys, 1)}</span>
      <span data-testid="three">{plural(rowsKeys, 3)}</span>
      <button type="button" onClick={() => setLocale("en")}>
        switch to en
      </button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <I18nProvider>
      <Probe />
    </I18nProvider>,
  );

describe("usePlural", () => {
  it("selects the singular and plural Spanish forms", () => {
    renderProbe();

    expect(screen.getByTestId("one")).toHaveTextContent("1 fila");
    expect(screen.getByTestId("three")).toHaveTextContent("3 filas");
  });

  it("selects the singular and plural English forms after switching locale", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "switch to en" }));

    expect(screen.getByTestId("one")).toHaveTextContent("1 row");
    expect(screen.getByTestId("three")).toHaveTextContent("3 rows");
  });
});
