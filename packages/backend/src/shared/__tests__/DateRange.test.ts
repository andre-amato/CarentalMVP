import { describe, expect, it } from '@jest/globals';
import { DateRange } from '../domain/DateRange';
describe('DateRange', () => {
  it('should create a valid date range', () => {
    const startDate = new Date('2023-07-01');
    const endDate = new Date('2023-07-05');
    const dateRange = new DateRange(startDate, endDate);

    expect(dateRange.startDate).toEqual(startDate);
    expect(dateRange.endDate).toEqual(endDate);
  });

  it('should throw error if start date is after end date', () => {
    const startDate = new Date('2023-07-05');
    const endDate = new Date('2023-07-01');

    expect(() => new DateRange(startDate, endDate)).toThrow(
      'Start date cannot be after end date'
    );
  });

  it('should check if a date is contained within the range', () => {
    const startDate = new Date('2023-07-01');
    const endDate = new Date('2023-07-05');
    const dateRange = new DateRange(startDate, endDate);

    const containedDate = new Date('2023-07-03');
    const beforeDate = new Date('2023-06-30');
    const afterDate = new Date('2023-07-06');

    expect(dateRange.containsDate(containedDate)).toBe(true);
    expect(dateRange.containsDate(beforeDate)).toBe(false);
    expect(dateRange.containsDate(afterDate)).toBe(false);
    expect(dateRange.containsDate(startDate)).toBe(true);
    expect(dateRange.containsDate(endDate)).toBe(true);
  });

  it('should check if two date ranges overlap', () => {
    const dateRange1 = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-05')
    );
    const dateRange2 = new DateRange(
      new Date('2023-07-03'),
      new Date('2023-07-08')
    );
    const dateRange3 = new DateRange(
      new Date('2023-07-06'),
      new Date('2023-07-10')
    );
    const dateRange4 = new DateRange(
      new Date('2023-06-25'),
      new Date('2023-06-30')
    );

    expect(dateRange1.overlaps(dateRange2)).toBe(true);
    expect(dateRange1.overlaps(dateRange3)).toBe(false);
    expect(dateRange1.overlaps(dateRange4)).toBe(false);
  });

  it('should calculate the number of days in the range', () => {
    const dateRange1 = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-05')
    );
    const dateRange2 = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-01')
    );

    expect(dateRange1.getDays()).toBe(5);
    expect(dateRange2.getDays()).toBe(1);
  });

  it('should handle edge cases for overlapping ranges', () => {
    const dateRange1 = new DateRange(
      new Date('2023-07-01'),
      new Date('2023-07-05')
    );
    const dateRange2 = new DateRange(
      new Date('2023-07-05'),
      new Date('2023-07-10')
    );
    const dateRange3 = new DateRange(
      new Date('2023-06-20'),
      new Date('2023-07-01')
    );

    expect(dateRange1.overlaps(dateRange2)).toBe(true); // End of range1 meets start of range2
    expect(dateRange1.overlaps(dateRange3)).toBe(true); // Start of range1 meets end of range3
  });
});
