import { describe, expect, it } from '@jest/globals';
import { Season, SeasonDeterminer } from '../domain/Season';

describe('SeasonDeterminer', () => {
  it('should determine peak season correctly', () => {
    expect(SeasonDeterminer.getSeason(new Date('2023-06-30'))).toBe(
      Season.PEAK
    );
    expect(SeasonDeterminer.getSeason(new Date('2023-07-15'))).toBe(
      Season.PEAK
    );
    expect(SeasonDeterminer.getSeason(new Date('2023-08-31'))).toBe(
      Season.PEAK
    );
    expect(SeasonDeterminer.getSeason(new Date('2023-09-15'))).toBe(
      Season.PEAK
    );
  });

  it('should determine mid season correctly', () => {
    // Test various dates in mid season
    // September 16-30
    expect(SeasonDeterminer.getSeason(new Date('2023-09-30'))).toBe(Season.MID);

    // October
    expect(SeasonDeterminer.getSeason(new Date('2023-10-01'))).toBe(Season.MID);
    expect(SeasonDeterminer.getSeason(new Date('2023-10-31'))).toBe(Season.MID);

    // March
    expect(SeasonDeterminer.getSeason(new Date('2023-03-31'))).toBe(Season.MID);

    // April
    expect(SeasonDeterminer.getSeason(new Date('2023-04-15'))).toBe(Season.MID);

    // May
    expect(SeasonDeterminer.getSeason(new Date('2023-05-15'))).toBe(Season.MID);
    expect(SeasonDeterminer.getSeason(new Date('2023-05-31'))).toBe(Season.MID);
  });

  it('should determine off season correctly', () => {
    // Test various dates in off season (November 1 - February)
    expect(SeasonDeterminer.getSeason(new Date('2023-11-30'))).toBe(Season.OFF);
    expect(SeasonDeterminer.getSeason(new Date('2023-12-15'))).toBe(Season.OFF);
    expect(SeasonDeterminer.getSeason(new Date('2024-01-15'))).toBe(Season.OFF);
    expect(SeasonDeterminer.getSeason(new Date('2024-02-28'))).toBe(Season.OFF);
  });
  it('should handle edge cases correctly', () => {
    // Edge cases at season boundaries
    expect(SeasonDeterminer.getSeason(new Date('2023-05-31'))).toBe(Season.MID);
    expect(SeasonDeterminer.getSeason(new Date('2023-09-15'))).toBe(
      Season.PEAK
    );
    expect(SeasonDeterminer.getSeason(new Date('2023-10-31'))).toBe(Season.MID);
    expect(SeasonDeterminer.getSeason(new Date('2024-02-29'))).toBe(Season.OFF);
  });
  it('should handle leap years correctly', () => {
    // Test February 29th on a leap year
    expect(SeasonDeterminer.getSeason(new Date('2024-02-29'))).toBe(Season.OFF);
  });
  it('should handle different years consistently', () => {
    // Test the same dates across different years
    expect(SeasonDeterminer.getSeason(new Date('2022-07-01'))).toBe(
      Season.PEAK
    );
    expect(SeasonDeterminer.getSeason(new Date('2023-07-01'))).toBe(
      Season.PEAK
    );
    expect(SeasonDeterminer.getSeason(new Date('2024-07-01'))).toBe(
      Season.PEAK
    );
  });
  it('should handle dates that are not exactly on boundaries', () => {
    // Test dates that fall clearly within seasons
    expect(SeasonDeterminer.getSeason(new Date('2023-06-15'))).toBe(
      Season.PEAK
    );
    expect(SeasonDeterminer.getSeason(new Date('2023-09-20'))).toBe(Season.MID);
    expect(SeasonDeterminer.getSeason(new Date('2023-12-31'))).toBe(Season.OFF);
  });
});
