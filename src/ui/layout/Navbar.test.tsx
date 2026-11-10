import { render, screen } from "@testing-library/react";
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
});
