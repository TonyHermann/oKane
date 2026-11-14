import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/ui/i18n";
import { Navbar } from "./Navbar";

const renderNavbar = () =>
  render(
    <I18nProvider>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </I18nProvider>,
  );

describe("Navbar", () => {
  it("renders the Spanish navigation labels", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Administrar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Presupuesto" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Configuración" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cambiar tema")).toBeInTheDocument();
  });

  it("moves focus through every navigation link in order with the keyboard", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.tab();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Administrar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Presupuesto" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Configuración" })).toHaveFocus();
  });

  it("gives navbar controls a visible focus ring for keyboard focus only", () => {
    // jsdom cannot compute the rendered outline, so the visible-focus half of
    // the behaviour is asserted on the stylesheet the app actually ships:
    // navbar controls must get a solid ring under :focus-visible and must not
    // keep the inherited outline for pointer focus.
    const css = readFileSync(
      resolve(process.cwd(), "src/ui/styles/layout/navbar.css"),
      "utf8",
    );

    expect(css).toMatch(
      /a:focus-visible,\s*button:focus-visible\s*\{[^}]*outline:\s*2px dashed/,
    );
    expect(css).toMatch(/a:focus:not\(:focus-visible\)/);
  });
});
