import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { NotFoundPage } from "./NotFoundPage";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: vi.fn() };
});

describe("NotFoundPage", () => {
  it("Render heading and message", () => {
    render(<NotFoundPage />, { wrapper: BrowserRouter });

    expect(screen.getByText("¡Oops!")).toBeInTheDocument();
  });

  it("navigates to home on button click", async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(<NotFoundPage />, { wrapper: BrowserRouter });
    await userEvent.click(screen.getByRole("button"));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
