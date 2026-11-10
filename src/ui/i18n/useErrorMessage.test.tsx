import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "./I18nProvider";
import { useErrorMessage } from "./useErrorMessage";
import { useTranslation } from "./useTranslation";

const Probe = () => {
  const { setLocale } = useTranslation();
  const getErrorMessage = useErrorMessage();

  return (
    <div>
      <span data-testid="load">{getErrorMessage("DATA_LOAD_FAILED")}</span>
      <span data-testid="apply">{getErrorMessage("RULES_APPLY_FAILED")}</span>
      <span data-testid="unknown">{getErrorMessage("UNKNOWN")}</span>
      <span data-testid="none">{getErrorMessage(null)}</span>
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

describe("useErrorMessage", () => {
  it("maps codes to Spanish messages", () => {
    renderProbe();

    expect(screen.getByTestId("load")).toHaveTextContent(
      "No se pudieron cargar los datos.",
    );
    expect(screen.getByTestId("apply")).toHaveTextContent(
      "No se pudieron aplicar las reglas.",
    );
    expect(screen.getByTestId("unknown")).toHaveTextContent(
      "Ocurrió un error inesperado.",
    );
    expect(screen.getByTestId("none")).toBeEmptyDOMElement();
  });

  it("maps codes to English messages after switching locale", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "switch to en" }));

    expect(screen.getByTestId("load")).toHaveTextContent(
      "The data could not be loaded.",
    );
    expect(screen.getByTestId("apply")).toHaveTextContent(
      "The rules could not be applied.",
    );
    expect(screen.getByTestId("unknown")).toHaveTextContent(
      "An unexpected error occurred.",
    );
    expect(screen.getByTestId("none")).toBeEmptyDOMElement();
  });
});
