import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "../../i18n";
import { LanguagePage } from "./LanguagePage";

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

const renderPage = () =>
  render(
    <I18nProvider>
      <LanguagePage />
    </I18nProvider>,
  );

describe("LanguagePage", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorage(),
    });
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      get: () => "es-AR",
    });
    document.documentElement.lang = "";
  });

  afterEach(() => {
    Reflect.deleteProperty(window.navigator, "language");
  });

  it("is labelled Idioma and starts at es", () => {
    renderPage();

    expect(screen.getByText("Idioma y región")).toBeInTheDocument();
    expect(screen.getByLabelText("Idioma")).toHaveValue("es");
  });

  it("switches to en and back to es", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText("Idioma"), "en");

    expect(screen.getByText("Language and region")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByLabelText("Language")).toHaveValue("en");

    await user.selectOptions(screen.getByLabelText("Language"), "es");

    expect(screen.getByText("Idioma y región")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("es");
  });
});
