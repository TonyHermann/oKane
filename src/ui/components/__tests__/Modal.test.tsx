/* eslint-disable no-undef */
// Jest globals are available: describe, it, expect, jest, beforeEach, afterEach
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "../Modal";

declare const jest: typeof import("jest");

describe("Modal", () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    title: "Test Modal",
    isOpen: true,
    onClose: mockOnClose,
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    // Clean up any DOM elements that might be left over
    document.body.innerHTML = "";
    document.querySelector("html")?.classList.remove("modal-open");
    const overlays = document.querySelectorAll(".modal-overlay");
    overlays.forEach((overlay) => overlay.remove());
  });

  afterEach(() => {
    mockOnClose.mockClear();
    document.body.innerHTML = "";
    document.querySelector("html")?.classList.remove("modal-open");
    const overlays = document.querySelectorAll(".modal-overlay");
    overlays.forEach((overlay) => overlay.remove());
  });

  describe("Rendering", () => {
    it("should render null when isOpen is false", () => {
      const { container } = render(
        <Modal {...defaultProps} isOpen={false}>
          <div>Content</div>
        </Modal>,
      );
      expect(container.firstChild).toBeNull();
    });

    it("should render modal when isOpen is true", () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal content")).toBeInTheDocument();
      expect(document.querySelector(".modal")).toBeInTheDocument();
    });

    it("should render with correct aria attributes", () => {
      render(<Modal {...defaultProps} />);

      const modal = document.querySelector(".modal");
      expect(modal).toHaveAttribute("aria-label", "dialog");
      expect(screen.getByText("Test Modal")).toHaveAttribute(
        "id",
        "modal-title",
      );
    });

    it("should render the close button with correct class", () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton).toHaveClass("closeBtnXP");
    });
  });

  describe("Interactions", () => {
    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when Escape key is pressed", () => {
      render(<Modal {...defaultProps} />);

      fireEvent.keyDown(window, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when other keys are pressed", () => {
      render(<Modal {...defaultProps} />);

      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.keyDown(window, { key: "Tab" });
      fireEvent.keyDown(window, { key: " " });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("DOM Manipulation", () => {
    it("should add modal-open class to html when opened", () => {
      render(<Modal {...defaultProps} />);

      expect(document.querySelector("html")).toHaveClass("modal-open");
    });

    it("should remove modal-open class from html when closed", async () => {
      const { rerender } = render(<Modal {...defaultProps} />);

      expect(document.querySelector("html")).toHaveClass("modal-open");

      rerender(
        <Modal {...defaultProps} isOpen={false}>
          <div>Content</div>
        </Modal>,
      );

      await waitFor(() => {
        expect(document.querySelector("html")).not.toHaveClass("modal-open");
      });
    });

    it("should create overlay element when opened", () => {
      render(<Modal {...defaultProps} />);

      const overlay = document.querySelector(".modal-overlay");
      expect(overlay).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should render without onClose callback", () => {
      const { container } = render(
        <Modal title="Test" isOpen={true}>
          <div>Content</div>
        </Modal>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle rapid open/close transitions", async () => {
      const { rerender } = render(
        <Modal title="Test" isOpen={true}>
          <div>Content</div>
        </Modal>,
      );

      expect(screen.getByText("Test")).toBeInTheDocument();

      rerender(
        <Modal title="Test" isOpen={false}>
          <div>Content</div>
        </Modal>,
      );

      await waitFor(() => {
        expect(screen.queryByText("Test")).not.toBeInTheDocument();
      });
    });

    it("should render children correctly", () => {
      render(
        <Modal {...defaultProps}>
          <button data-testid="child-button">Child Button</button>
        </Modal>,
      );

      expect(screen.getByTestId("child-button")).toBeInTheDocument();
    });
  });
});
