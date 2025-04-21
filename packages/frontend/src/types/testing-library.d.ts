import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface Assertion {
      toBeInTheDocument(): void;
      // Add other Testing Library matchers if needed
    }
  }
}

export {};
