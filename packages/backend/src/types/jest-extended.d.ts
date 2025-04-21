import 'chai';

declare global {
  namespace Chai {
    interface Assertion {
      // Jest assertion methods
      toBe(expected: any): Assertion;
      toBeDefined(): Assertion;
      toBeCloseTo(expected: number, precision?: number): Assertion;
      toBeGreaterThan(expected: number): Assertion;
      toMatch(pattern: RegExp | string): Assertion;
      // Add other Jest assertions as needed
    }
  }
}

// This is an export to make it a module
export {};
