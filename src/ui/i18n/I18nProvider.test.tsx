import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "./I18nProvider";
import { useTranslation } from "./useTranslation";

const Probe = () => {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <span>{t("nav.home")}</span>
      <span data-testid="rowCount">
        {t("common.rowCount", { count: 3 })}
      </span>
      <span data-testid="locale">{locale}</span>
      <button type="button" onClick={() => setLocale("es")}>
        change
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

const setNavigatorLanguage = (language: string) => {
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    get: () => language,
  });
};

// Vitest's jsdom environment loses jsdom's localStorage when Node exposes its
// own disabled webstorage global, so the tests provide a deterministic stub.
const createStorage = (): Storage => {
  let entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear() {
      entries = new Map();
    },
    getItem(key: string) {
      return entries.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    setItem(key: string, value: string) {
      entries.set(key, String(value));
    },
  };
};

describe("I18nProvider", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorage(),
    });
    document.documentElement.lang = "";
  });

  afterEach(() => {
    Reflect.deleteProperty(window.navigator, "language");
  });

  it("renders es messages and sets document.documentElement.lang to es", () => {
    setNavigatorLanguage("en-US");

    renderProbe();

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("es");
  });

  it("restores a stored supported locale", () => {
    window.localStorage.setItem("okane.locale", "es");
    setNavigatorLanguage("en-US");

    renderProbe();

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByTestId("locale")).toHaveTextContent("es");
  });

  it("falls back to es when the stored locale is unsupported", () => {
    window.localStorage.setItem("okane.locale", "en");
    setNavigatorLanguage("en-US");

    renderProbe();

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByTestId("locale")).toHaveTextContent("es");
    expect(window.localStorage.getItem("okane.locale")).toBe("es");
  });

  it("writes the active locale to storage when setLocale is called", () => {
    setNavigatorLanguage("en-US");

    renderProbe();
    fireEvent.click(screen.getByRole("button", { name: "change" }));

    expect(window.localStorage.getItem("okane.locale")).toBe("es");
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("interpolates named parameters", () => {
    setNavigatorLanguage("en-US");

    renderProbe();

    expect(screen.getByTestId("rowCount")).toHaveTextContent("3 filas");
  });
});
