import matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Clean up after each test case
afterEach(() => {
  cleanup();
});
