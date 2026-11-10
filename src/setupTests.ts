import "@testing-library/jest-dom";

// jsdom reports en-US; pin the locale so provider-dependent tests are
// deterministic regardless of the host environment.
Object.defineProperty(window.navigator, "language", {
  configurable: true,
  value: "es-ES",
});
